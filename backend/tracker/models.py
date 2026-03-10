from django.db import models
from django.conf import settings

class DayProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='progress')
    date = models.DateField()
    total_seconds = models.IntegerField(default=0)
    is_completed = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'date')
        
    def __str__(self):
        return f"{self.user.username} - {self.date} - {self.total_seconds}s"
