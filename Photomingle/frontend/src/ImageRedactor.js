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

  // Настройки изображения
  const [imageSettings, setImageSettings] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    sharpness: 0,
    hue: 0,
    shadow: 0,
    highlight: 0,
  });


  const getImageFilterStyle = () => {
    return {
      filter: `
        brightness(${imageSettings.brightness}%)
        contrast(${imageSettings.contrast}%)
        saturate(${imageSettings.saturation}%)
        hue-rotate(${imageSettings.hue}deg)
      `,
    };
  };

  const handleSettingChange = (setting, value) => {
    setImageSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const getCroppedImage = async () => {
    if (!imageRef.current || !selectedFile) return null;

    const format = formats.find(f => f.name === printFormat);
    const scale = imageInfo.naturalWidth / imageInfo.displayedWidth;
    
    // Рассчитываем реальные координаты и размеры обрезки
    const [displayWidth, displayHeight] = calculateCropSize(format.ratio);
    const realWidth = displayWidth * scale;
    const realHeight = displayHeight * scale;
    
    // Проверяем, чтобы область обрезки не выходила за границы изображения
    const maxX = imageInfo.naturalWidth - realWidth;
    const maxY = imageInfo.naturalHeight - realHeight;
    const realX = Math.min(Math.max(cropArea.x * scale, 0), maxX);
    const realY = Math.min(Math.max(cropArea.y * scale, 0), maxY);

    // Создаем canvas для обрезки
    const canvas = document.createElement('canvas');
    canvas.width = realWidth;
    canvas.height = realHeight;
    
    const ctx = canvas.getContext('2d');
    
    // Применяем фильтры к изображению
    ctx.filter = `
      brightness(${imageSettings.brightness}%)
      contrast(${imageSettings.contrast}%)
      saturate(${imageSettings.saturation}%)
      hue-rotate(${imageSettings.hue}deg)
    `;
    
    ctx.drawImage(
      imageRef.current,
      realX, realY,          // Начальные координаты обрезки
      realWidth, realHeight, // Размеры области обрезки
      0, 0,                  // Начальные координаты на canvas
      realWidth, realHeight  // Размеры на canvas
    );

    // Дополнительная обработка теней и засветки
    if (imageSettings.shadow !== 0 || imageSettings.highlight !== 0) {
      const shadowHighlightCanvas = document.createElement('canvas');
      shadowHighlightCanvas.width = realWidth;
      shadowHighlightCanvas.height = realHeight;
      const shCtx = shadowHighlightCanvas.getContext('2d');
      
      shCtx.drawImage(canvas, 0, 0);
      
      // Применяем тени и засветки
      if (imageSettings.shadow !== 0) {
        shCtx.globalCompositeOperation = 'multiply';
        shCtx.fillStyle = `rgba(0,0,0,${Math.abs(imageSettings.shadow)/100})`;
        shCtx.fillRect(0, 0, realWidth, realHeight);
      }
      
      if (imageSettings.highlight !== 0) {
        shCtx.globalCompositeOperation = 'screen';
        shCtx.fillStyle = `rgba(255,255,255,${Math.abs(imageSettings.highlight)/100})`;
        shCtx.fillRect(0, 0, realWidth, realHeight);
      }
      
      shCtx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, realWidth, realHeight);
      ctx.drawImage(shadowHighlightCanvas, 0, 0);
    }

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
      containerHeight / img.naturalHeight,
      1 // Максимальный масштаб - 100%
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
  
    // Сброс позиции кадрирования
    setCropArea({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (previewUrl) {
      // При смене формата сбрасываем позицию кадрирования
      setCropArea({ x: 0, y: 0 });
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
  
    // Ограничиваем перемещение рамки границами изображения
    const maxX = imageInfo.displayedWidth - width;
    const maxY = imageInfo.displayedHeight - height;
    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));
  
    setCropArea({ x: newX, y: newY });
  };

  const calculateCropSize = (ratio) => {
    if (!imageInfo.displayedWidth || !imageInfo.displayedHeight) return [0, 0];
    
    let width, height;
    
    // Рассчитываем размеры рамки кадрирования в зависимости от соотношения сторон
    if (ratio > imageInfo.displayedWidth / imageInfo.displayedHeight) {
      // Если соотношение сторон формата шире, чем у изображения
      width = imageInfo.displayedWidth;
      height = width / ratio;
    } else {
      // Если соотношение сторон формата уже или такое же, как у изображения
      height = imageInfo.displayedHeight;
      width = height * ratio;
    }
    
    // Гарантируем, что рамка не будет слишком маленькой
    const minSize = 30; // Минимальный размер рамки в пикселях
    if (width < minSize) {
      width = minSize;
      height = width / ratio;
      // Проверяем, чтобы высота не превышала доступную
      if (height > imageInfo.displayedHeight) {
        height = imageInfo.displayedHeight;
        width = height * ratio;
      }
    }
    if (height < minSize) {
      height = minSize;
      width = height * ratio;
      // Проверяем, чтобы ширина не превышала доступную
      if (width > imageInfo.displayedWidth) {
        width = imageInfo.displayedWidth;
        height = width / ratio;
      }
    }
    
    return [width, height];
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getCropBoxStyle = () => {
    if (!previewUrl || !imageInfo.displayedWidth || !imageInfo.displayedHeight) return {};
    
    const format = formats.find(f => f.name === printFormat);
  const [width, height] = calculateCropSize(format.ratio);

  // Рассчитываем максимально возможные координаты, чтобы рамка не выходила за границы
  const maxX = imageInfo.displayedWidth - width;
  const maxY = imageInfo.displayedHeight - height;
  
  // Ограничиваем текущие координаты рамки
  const boundedX = Math.max(0, Math.min(cropArea.x, maxX));
  const boundedY = Math.max(0, Math.min(cropArea.y, maxY));

  // Если текущие координаты были за пределами, обновляем состояние
  if (cropArea.x !== boundedX || cropArea.y !== boundedY) {
    setTimeout(() => setCropArea({ x: boundedX, y: boundedY }), 0);
  }

  return {
    position: 'absolute',
    border: '2px dashed rgba(255,255,255,0.8)',
    width: `${width}px`,
    height: `${height}px`,
    left: `${imageInfo.offsetX}px`,
    top: `${imageInfo.offsetY}px`,
    transform: `translate(${boundedX}px, ${boundedY}px)`,
    cursor: 'move',
    boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
    pointerEvents: 'auto',
  };
  };

  const renderSettingSlider = (label, setting, min, max, step = 1) => (
    <div style={{ marginBottom: '15px' }}>
      <label style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        color: 'white',
        marginBottom: '5px'
      }}>
        <span>{label}</span>
        <span>{imageSettings[setting]}{setting === 'hue' ? '°' : '%'}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={imageSettings[setting]}
        onChange={(e) => handleSettingChange(setting, parseInt(e.target.value))}
        style={{
          width: '100%',
          height: '6px',
          borderRadius: '3px',
          background: 'linear-gradient(to right, #f5f5f5, #4CAF50)',
          outline: 'none',
        }}
      />
    </div>
  );

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
              onMouseDown={handleMouseDown}
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
                  ...getImageFilterStyle()
                }}
              />
              <div 
                style={getCropBoxStyle()} 
                onMouseDown={handleMouseDown}
              />
            </div>

            {/* Настройки изображения */}
            <div style={{
              marginTop: '20px',
              backgroundColor: 'rgba(0,0,0,0.2)',
              padding: '15px',
              borderRadius: '4px'
            }}>
              <h4 style={{ color: 'white', marginTop: 0 }}>Настройки изображения</h4>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px'
              }}>
                <div>
                  {renderSettingSlider('Яркость', 'brightness', 0, 200)}
                  {renderSettingSlider('Контраст', 'contrast', 0, 200)}
                  {renderSettingSlider('Насыщенность', 'saturation', 0, 200)}
                  {renderSettingSlider('Цветовой баланс', 'hue', -180, 180)}
                </div>
                <div>
                  {renderSettingSlider('Резкость', 'sharpness', 0, 100)}
                  {renderSettingSlider('Тени', 'shadow', -100, 100)}
                  {renderSettingSlider('Засветка', 'highlight', -100, 100)}
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '15px' }}>
                <button 
                  onClick={() => setImageSettings({
                    brightness: 100,
                    contrast: 100,
                    saturation: 100,
                    sharpness: 0,
                    hue: 0,
                    shadow: 0,
                    highlight: 0,
                  })}
                  style={{
                    padding: '8px 15px',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Сбросить настройки
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Кнопка создания */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button 
            onClick={handleCreateOrder} 
            disabled={creating}
            style={{
              padding: '12px 30px',
              backgroundColor: creating ? '#ccc' : 'white',
              color: creating ? '#666' : '#4CAF50',
              border: 'none',
              borderRadius: '4px',
              cursor: (creating || !selectedFile) ? 'not-allowed' : 'pointer',
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
