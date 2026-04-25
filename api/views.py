"""
API views for the Asset Management System.
"""
from datetime import date
from django.db.models import Count, Q
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken

from apps.assets.models import Asset
from apps.inventory.models import Inventory
from apps.assignments.models import Assignment
from apps.tickets.models import Ticket
from .serializers import (
    AssetSerializer, InventorySerializer, AssignmentSerializer,
    TicketSerializer, DashboardSerializer
)
from .permissions import (
    IsAdminOrTechnician, IsOwnerOrAdminOrTechnician, TicketPermission
)
from .filters import AssetFilter, InventoryFilter, AssignmentFilter, TicketFilter


class AssetViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Asset model with full CRUD operations.
    
    Provides:
    - List assets with filtering, search, and pagination
    - Create new assets (Admin/Technician only)
    - Retrieve asset details
    - Update asset information (Admin/Technician only)
    - Delete assets (Admin only)
    """
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer
    permission_classes = [IsAdminOrTechnician]
    filterset_class = AssetFilter
    search_fields = ['name', 'serial_number', 'brand', 'model']
    ordering_fields = ['name', 'created_at', 'purchase_date']
    ordering = ['-created_at']

    def get_permissions(self):
        """Override permissions for different actions."""
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [IsAdminOrTechnician]
        return [permission() for permission in permission_classes]


class InventoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Inventory model with full CRUD operations.
    
    Provides inventory management with stock level tracking.
    """
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    permission_classes = [IsAdminOrTechnician]
    filterset_class = InventoryFilter
    search_fields = ['name', 'sku', 'supplier']
    ordering_fields = ['name', 'quantity_in_stock', 'created_at']
    ordering = ['name']

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Get items with low stock levels."""
        from django.db import models
        low_stock_items = self.queryset.filter(
            quantity_in_stock__lte=models.F('minimum_stock_level')
        )
        serializer = self.get_serializer(low_stock_items, many=True)
        return Response(serializer.data)

class AssignmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Assignment model with role-based access.
    
    Provides asset assignment management with automatic status updates.
    """
    queryset = Assignment.objects.select_related('asset', 'assigned_to', 'assigned_by')
    serializer_class = AssignmentSerializer
    permission_classes = [IsOwnerOrAdminOrTechnician]
    filterset_class = AssignmentFilter
    ordering_fields = ['assigned_date', 'expected_return_date']
    ordering = ['-assigned_date']

    def perform_create(self, serializer):
        """Set the assigned_by field to the current user."""
        serializer.save(assigned_by=self.request.user)

    def get_queryset(self):
        """Filter queryset based on user role."""
        queryset = super().get_queryset()
        user = self.request.user
        
        if user.is_admin or user.is_technician:
            return queryset
        else:
            # Regular users can only see their own assignments
            return queryset.filter(assigned_to=user)

    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get assignments created today."""
        today_assignments = self.queryset.filter(assigned_date__date=date.today())
        serializer = self.get_serializer(today_assignments, many=True)
        return Response(serializer.data)


class TicketViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Ticket model with custom permissions.
    
    Provides support ticket management with role-based access control.
    """
    queryset = Ticket.objects.select_related('created_by', 'assigned_to', 'asset')
    serializer_class = TicketSerializer
    permission_classes = [TicketPermission]
    filterset_class = TicketFilter
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'priority', 'status']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        """Set the created_by field to the current user."""
        serializer.save(created_by=self.request.user)

    def get_queryset(self):
        """Filter queryset based on user role."""
        queryset = super().get_queryset()
        user = self.request.user
        
        if user.is_admin or user.is_technician:
            return queryset
        else:
            # Regular users can only see their own tickets
            return queryset.filter(created_by=user)

    @action(detail=False, methods=['get'])
    def open(self, request):
        """Get open tickets."""
        open_tickets = self.queryset.filter(status=Ticket.Status.OPEN)
        serializer = self.get_serializer(open_tickets, many=True)
        return Response(serializer.data)


class DashboardViewSet(viewsets.ViewSet):
    """
    ViewSet for dashboard statistics.
    
    Provides system-wide statistics for the dashboard.
    """
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get dashboard statistics."""
        stats = {
            'total_assets': Asset.objects.count(),
            'available_assets': Asset.objects.filter(status=Asset.Status.AVAILABLE).count(),
            'assigned_assets': Asset.objects.filter(status=Asset.Status.ASSIGNED).count(),
            'inventory_items': Inventory.objects.count(),
            'open_tickets': Ticket.objects.filter(status=Ticket.Status.OPEN).count(),
            'assignments_today': Assignment.objects.filter(assigned_date__date=date.today()).count(),
        }
        
        serializer = DashboardSerializer(stats)
        return Response(serializer.data)


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom JWT token view with user information."""
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            # Add user information to the response
            from django.contrib.auth import get_user_model
            User = get_user_model()
            try:
                user = User.objects.get(email=request.data.get('email'))
                response.data['user'] = {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user.role,
                }
            except User.DoesNotExist:
                pass
        return response


class LogoutView(viewsets.ViewSet):
    """Custom logout view to blacklist refresh token."""
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def logout(self, request):
        """Logout user by blacklisting refresh token."""
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)