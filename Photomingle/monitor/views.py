import psutil
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


class MonitorView(APIView):
    def get(self, request):
        if not request.user.is_staff:
            return Response({"error":"Forbidden!"}, status=status.HTTP_403_FORBIDDEN)
        # RAM
        virtual_mem = psutil.virtual_memory()
        ram_total = virtual_mem.total
        ram_used = virtual_mem.used
        ram_percent = virtual_mem.percent

        # Disk
        disk_usage = psutil.disk_usage('/')
        disk_total = disk_usage.total
        disk_used = disk_usage.used
        disk_percent = disk_usage.percent

        processes = []
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
            try:
                info = proc.info

                # Фильтруем системные/виртуальные процессы
                if not info['name']:
                    continue
                name = info['name'].lower()
                if any(bad in name for bad in ['idle', 'system', 'interrupt']):
                    continue

                # Ограничиваем проценты CPU до разумных значений
                cpu = min(max(info.get('cpu_percent', 0), 0), 100)
                mem = min(max(info.get('memory_percent', 0), 0), 100)

                processes.append({
                    'pid': info['pid'],
                    'name': info['name'],
                    'cpu_percent': round(cpu, 1),
                    'memory_percent': round(mem, 1),
                })

            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                continue

        # --- Sort by CPU and RAM descending ---
        processes.sort(key=lambda p: (p['cpu_percent'], p['memory_percent']), reverse=True)
        top_processes = processes[:20]
        cpu_percent = sum(p['cpu_percent'] for p in top_processes)

        data = {
            'cpu': {'percent': cpu_percent},
            'ram': {'total': ram_total, 'used': ram_used, 'percent': ram_percent},
            'disk': {'total': disk_total, 'used': disk_used, 'percent': disk_percent},
            'processes': top_processes,
        }

        return Response(data)
