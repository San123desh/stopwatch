from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    start_date = models.DateField(auto_now_add=True)
    timezone = models.CharField(max_length=50, default='UTC')
    otp_code = models.CharField(max_length=6, blank=True, null=True)
    otp_created_at = models.DateTimeField(blank=True, null=True)
