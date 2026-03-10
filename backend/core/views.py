from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import authenticate, logout
from django.utils import timezone
from rest_framework.authtoken.models import Token
import random
from django.core.mail import send_mail

from .serializers import UserSerializer

class AuthViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'user': UserSerializer(user).data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        
        if user:
            otp = f"{random.randint(100000, 999999)}"
            user.otp_code = otp
            user.otp_created_at = timezone.now()
            user.save()
            
            print(f"--- SENT OTP to {user.email}: {otp} ---")
            send_mail(
                'Your Login OTP',
                f'Your verification code is: {otp}',
                'noreply@stopwatch.local',
                [user.email],
                fail_silently=False,
            )
            
            return Response({
                "detail": "OTP Sent",
                "otp_needed": True,
                "username": user.username
            })
        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def verify_otp(self, request):
        username = request.data.get('username')
        otp = request.data.get('otp')
        
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
             return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
             
        if user.otp_code and user.otp_code == otp:
            user.otp_code = None 
            user.save()
            
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data
            })
        else:
             return Response({'detail': 'Invalid or Expired OTP'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def logout(self, request):
        logout(request)
        return Response({'detail': 'Logged out successfully'})
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        if request.user.is_authenticated:
            return Response(UserSerializer(request.user).data)
        return Response({'detail': 'Not authenticated'}, status=status.HTTP_403_FORBIDDEN)
