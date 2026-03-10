from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProgressViewSet, GridDataViewSet

router = DefaultRouter()
router.register(r'progress', ProgressViewSet, basename='progress')
router.register(r'grid-data', GridDataViewSet, basename='grid-data')

urlpatterns = [
    path('', include(router.urls)),
]
