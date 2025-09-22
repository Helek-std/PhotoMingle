import psutil
from rest_framework.response import Response
from rest_framework.views import APIView


class MonitorView(APIView):
    def get(self, request):
        # CPU
        cpu_percent = psutil.cpu_percent(interval=1)
        cpu_count = psutil.cpu_count()

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

        # Running processes
        processes = []
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
            processes.append(proc.info)

        data = {
            'cpu': {'percent': cpu_percent, 'count': cpu_count},
            'ram': {'total': ram_total, 'used': ram_used, 'percent': ram_percent},
            'disk': {'total': disk_total, 'used': disk_used, 'percent': disk_percent},
            'processes': processes[:20],  # первые 20 процессов
        }

        return Response(data)
