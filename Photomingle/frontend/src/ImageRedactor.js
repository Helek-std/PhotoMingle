import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';

const ImageRedactor = () => {
  const { orderId } = useParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState('');

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [printFormat, setPrintFormat] = useState('3x4');
  const [cropArea, setCropArea] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const [formats, setFormats] = useState([]);
  const [imageInfo, setImageInfo] = useState({
    naturalWidth: 0,
    naturalHeight: 0,
    displayedWidth: 0,
    displayedHeight: 0,
    offsetX: 0,
    offsetY: 0,
  });

  const getCroppedImage = async () => {
    if (!imageRef.current || !selectedFile) return null;

    const format = formats.find(f => f.name === printFormat);
    const scale = imageInfo.naturalWidth / imageInfo.displayedWidth;
    
    // Рассчитываем реальные координаты и размеры обрезки
    const realX = cropArea.x * scale;
    const realY = cropArea.y * scale;
    const [displayWidth, displayHeight] = calculateCropSize(format.ratio);
    const realWidth = displayWidth * scale;
    const realHeight = displayHeight * scale;

    // Создаем canvas для обрезки
    const canvas = document.createElement('canvas');
    canvas.width = realWidth;
    canvas.height = realHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      imageRef.current,
      realX, realY,          // Начальные координаты обрезки
      realWidth, realHeight, // Размеры области обрезки
      0, 0,                  // Начальные координаты на canvas
      realWidth, realHeight  // Размеры на canvas
    );

    // Конвертируем canvas в Blob
    return new Promise((resolve) => {
      canvas.toBlob(blob => {
        resolve(new File([blob], selectedFile.name, {
          type: 'image/jpeg',
          lastModified: Date.now()
        }));
      }, 'image/jpeg', 0.9);
    });
  };
  
  const handleImageLoad = () => {
    if (!imageRef.current || !containerRef.current) return;

    const img = imageRef.current;
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Рассчитываем масштаб для вписывания изображения
    const scale = Math.min(
      containerWidth / img.naturalWidth,
      containerHeight / img.naturalHeight
    );

    // Фактические размеры отображаемого изображения
    const displayedWidth = img.naturalWidth * scale;
    const displayedHeight = img.naturalHeight * scale;

    // Смещение для центрирования
    const offsetX = (containerWidth - displayedWidth) / 2;
    const offsetY = (containerHeight - displayedHeight) / 2;

    setImageInfo({
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      displayedWidth,
      displayedHeight,
      offsetX,
      offsetY,
    });

    
  };

  useEffect(() => {
    if (previewUrl) {
      setCropArea({ x: 0, y: 0 }); // Сброс позиции при смене формата
    }
  }, [printFormat, previewUrl]);
  useEffect(() => {
  const fetchOrderAndFormats = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}/addImage/`);
      const data = await response.json();

      const formatData = data.print_formats.map(f => ({
        ...f,
        ratio: f.width_mm / f.height_mm,
      }));

      setOrders([data.order]); // если где-то используется orders
      setFormats(formatData);

      if (!printFormat && formatData.length > 0) {
        setPrintFormat(formatData[0].name);
      }

      setLoading(false);
    } catch (err) {
      console.error('Ошибка при загрузке данных:', err);
      setError('Не удалось загрузить данные');
      setLoading(false);
    }
  };

  fetchOrderAndFormats();
}, [orderId]);
  const handleCreateOrder = async () => {

    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Вы не авторизованы!');
      return;
    }

    setCreating(true);

    try {
      const formData = new FormData();
      formData.append('print_format', printFormat);
      
      if (selectedFile) {
        const croppedFile = await getCroppedImage();
        if (!croppedFile) throw new Error('Ошибка при обрезке изображения');

        formData.append('image', croppedFile);
        formData.append('crop_x', imageInfo.displayedWidth);
        formData.append('crop_y', imageInfo.displayedHeight);
      }

      const response = await fetch(`/api/orders/${orderId}/addImage/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Ошибка ${response.status}`);
      }

      setNewName('');
      setSelectedFile(null);
      setPreviewUrl('');
      setShowCreateForm(false);
    } catch (err) {
      alert(`Ошибка при создании заказа: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
      setCropArea({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e) => {
    if (!previewUrl) return;
    setIsDragging(true);
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - imageInfo.offsetX;
    const y = e.clientY - rect.top - imageInfo.offsetY;
    
    setDragStart({
      x: x - cropArea.x,
      y: y - cropArea.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !previewUrl) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - imageInfo.offsetX;
    const mouseY = e.clientY - rect.top - imageInfo.offsetY;

    // Размеры рамки кадрирования
    const format = formats.find(f => f.name === printFormat);
    const [width, height] = calculateCropSize(format.ratio);

    // Новые координаты с ограничениями
    let newX = mouseX - dragStart.x;
    let newY = mouseY - dragStart.y;

    newX = Math.max(0, Math.min(newX, imageInfo.displayedWidth - width));
    newY = Math.max(0, Math.min(newY, imageInfo.displayedHeight - height));

    setCropArea({ x: newX, y: newY });
  };

  const calculateCropSize = (ratio) => {
    let width, height;
    
    if (ratio > imageInfo.displayedWidth / imageInfo.displayedHeight) {
      width = imageInfo.displayedWidth;
      height = width / ratio;
    } else {
      height = imageInfo.displayedHeight;
      width = height * ratio;
    }
    
    return [width, height];
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getCropBoxStyle = () => {
    if (!previewUrl) return {};
    
    const format = formats.find(f => f.name === printFormat);
    const [width, height] = calculateCropSize(format.ratio);

    return {
      position: 'absolute',
      border: '2px dashed rgba(255,255,255,0.8)',
      width: `${width}px`,
      height: `${height}px`,
      transform: `translate(${cropArea.x}px, ${cropArea.y}px)`,
      cursor: 'move',
      boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
      left: `${imageInfo.offsetX}px`,
      top: `${imageInfo.offsetY}px`,
    };
  };


  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>

      {/* Форма создания заказа - всегда видима */}
      <div style={{
        backgroundColor: '#4CAF50',
        padding: '25px',
        borderRadius: '8px',
        margin: '20px auto',
        maxWidth: '800px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ color: 'white', marginTop: 0, textAlign: 'center' }}>Добавление фотографии</h3>
        
        {/* Выбор формата */}
        <div style={{ 
          margin: '20px 0',
          backgroundColor: 'rgba(255,255,255,0.2)',
          padding: '15px',
          borderRadius: '4px'
        }}>
          <h4 style={{ color: 'white', marginTop: 0 }}>Формат печати</h4>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
            gap: '10px'
          }}>
            {formats.map(format => (
              <button
                key={format.name}
                onClick={() => setPrintFormat(format.name)}
                style={{
                  padding: '8px',
                  backgroundColor: printFormat === format.name ? '#fff' : 'rgba(255,255,255,0.3)',
                  color: printFormat === format.name ? '#4CAF50' : 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: printFormat === format.name ? 'bold' : 'normal'
                }}
              >
                {format.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Загрузка фото */}
        <div style={{ 
          margin: '20px 0',
          backgroundColor: 'rgba(255,255,255,0.2)',
          padding: '15px',
          borderRadius: '4px'
        }}>
          <h4 style={{ color: 'white', marginTop: 0 }}>Загрузка фотографии</h4>
          <label style={{
            display: 'inline-block',
            padding: '10px 15px',
            backgroundColor: 'white',
            color: '#4CAF50',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}>
            Выбрать файл
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </label>
          {selectedFile && (
            <span style={{ color: 'white', marginLeft: '10px' }}>
              {selectedFile.name}
            </span>
          )}
        </div>
        
        {/* Область предпросмотра */}
        {previewUrl && (
          <div style={{ 
            margin: '20px 0',
            backgroundColor: 'rgba(255,255,255,0.2)',
            padding: '15px',
            borderRadius: '4px'
          }}>
            <h4 style={{ color: 'white', marginTop: 0 }}>Выберите область печати</h4>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
              Перетащите рамку чтобы выбрать область для печати формата {printFormat}
            </p>
            <div 
              ref={containerRef}
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '600px',
                height: '400px',
                margin: '15px auto',
                overflow: 'hidden',
                border: '2px solid rgba(255,255,255,0.3)',
                cursor: isDragging ? 'grabbing' : 'default',
              }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img
                ref={imageRef}
                src={previewUrl}
                alt="Preview"
                onLoad={handleImageLoad}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  width: 'auto',
                  height: 'auto',
                }}
              />
              <div 
                style={getCropBoxStyle()} 
                onMouseDown={handleMouseDown}
              />
            </div>
          </div>
        )}

        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          marginTop: '20px',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <button
            onClick={handleCreateOrder}
            disabled={creating}
            style={{
              padding: '12px 30px',
              backgroundColor: creating ? '#ccc' : 'white',
              color: creating ? '#666' : '#4CAF50',
              border: 'none',
              borderRadius: '4px',
              cursor: creating ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}
          >
            {creating ? 'Добавление...' : 'Добавить фото'}
          </button>

          <button
            onClick={() => window.history.back()}
            style={{
              padding: '12px 30px',
              backgroundColor: 'transparent',
              color: 'white',
              border: '2px solid white',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'background-color 0.3s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Назад к заказу
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageRedactor;