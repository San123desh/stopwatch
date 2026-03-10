from django.contrib import admin
from django.urls import path, include

from django.views.generic import TemplateView
from django.views.static import serve
from django.conf import settings
from django.urls import re_path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),
    path('api/', include('tracker.urls')),
    path('', TemplateView.as_view(template_name='index.html'), name='index'),
    re_path(r'^(?P<path>.*)$', serve, {'document_root': settings.BASE_DIR / 'frontend'}),
]
