from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
import datetime

from .models import DayProgress
from .serializers import DayProgressSerializer

class ProgressViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        queryset = DayProgress.objects.filter(user=request.user)
        serializer = DayProgressSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def update_progress(self, request):
        date_str = request.data.get('date')
        duration = request.data.get('session_duration', 0)

        if not date_str:
            return Response({'detail': 'Date required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            date_obj = datetime.datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'detail': 'Invalid date format'}, status=status.HTTP_400_BAD_REQUEST)

        # Anti-cheating
        if date_obj > datetime.date.today() + datetime.timedelta(days=1):
             return Response({'detail': 'Cannot update future dates'}, status=status.HTTP_400_BAD_REQUEST)

        progress, created = DayProgress.objects.get_or_create(user=request.user, date=date_obj)
        progress.total_seconds += int(duration)
        
        # Check completion (2 hours threshold)
        if progress.total_seconds >= 7200:
            progress.is_completed = True
        
        progress.save()
        return Response(DayProgressSerializer(progress).data)

class GridDataViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        user = request.user
        user_tz = datetime.timezone.utc
        now_in_tz = timezone.now().astimezone(user_tz)
        today = now_in_tz.date()
        start_date = user.start_date
        
        def date_range(start, end):
            for n in range(int((end - start).days) + 1):
                yield start + timedelta(n)

        progress_data = {
            p.date: p 
            for p in DayProgress.objects.filter(user=user)
        }
        
        grid_data = []
        calc_start = today if start_date > today else start_date

        for single_date in date_range(calc_start, today):
            progress = progress_data.get(single_date)
            status_color = 'red' 
            
            if progress:
                # 10s threshold
                if progress.total_seconds >= 7200: # 2 hours
                    status_color = 'green'
                else:
                    status_color = 'red'
            else:
                status_color = 'red'
                
            grid_data.append({
                'date': single_date,
                'status': status_color,
                'total_seconds': progress.total_seconds if progress else 0
            })
            
        return Response({
            'start_date': start_date,
            'current_date': today,
            'timezone': user.timezone,
            'grid': grid_data
        })
