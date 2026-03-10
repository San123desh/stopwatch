from rest_framework import serializers
from .models import DayProgress

class DayProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = DayProgress
        fields = ('date', 'total_seconds', 'is_completed')
