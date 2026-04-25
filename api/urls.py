"""
URL configuration for the Asset Management System API.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .views import (
    AssetViewSet, InventoryViewSet, AssignmentViewSet, TicketViewSet,
    DashboardViewSet, CustomTokenObtainPairView, LogoutView
)

@api_view(['GET'])
@permission_classes([AllowAny])
def api_info(request):
    """API information endpoint."""
    return Response({
        'name': 'Asset Management System API',
        'version': '1.0.0',
        'description': 'Production-ready Django REST API for Asset Management',
        'features': [
            'JWT Authentication',
            'Role-based Access Control',
            'Asset Lifecycle Management',
            'Inventory Tracking',
            'Assignment System',
            'Support Tickets',
            'Dashboard Analytics'
        ],
        'endpoints': {
            'auth': {
                'login': '/api/auth/login/',
                'refresh': '/api/auth/refresh/',
                'logout': '/api/auth/logout/'
            },
            'resources': {
                'assets': '/api/assets/',
                'inventory': '/api/inventory/',
                'assignments': '/api/assignments/',
                'tickets': '/api/tickets/'
            },
            'analytics': {
                'dashboard': '/api/dashboard/stats/'
            }
        }
    })

# Create router and register viewsets
router = DefaultRouter()
router.register(r'assets', AssetViewSet)
router.register(r'inventory', InventoryViewSet)
router.register(r'assignments', AssignmentViewSet)
router.register(r'tickets', TicketViewSet)
router.register(r'dashboard', DashboardViewSet, basename='dashboard')

urlpatterns = [
    # API info
    path('info/', api_info, name='api_info'),
    
    # Authentication endpoints
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', LogoutView.as_view({'post': 'logout'}), name='logout'),
    
    # API endpoints
    path('', include(router.urls)),
]