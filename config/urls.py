"""
URL configuration for Asset Management System.
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

@require_http_methods(["GET"])
def api_root(request):
    """Root API endpoint with system information."""
    return JsonResponse({
        'message': 'Asset Management System API',
        'version': '1.0.0',
        'status': 'running',
        'endpoints': {
            'authentication': '/api/auth/',
            'assets': '/api/assets/',
            'inventory': '/api/inventory/',
            'assignments': '/api/assignments/',
            'tickets': '/api/tickets/',
            'dashboard': '/api/dashboard/stats/',
            'admin': '/admin/',
        },
        'documentation': 'See README.md for API documentation'
    })

urlpatterns = [
    path('', api_root, name='api_root'),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]