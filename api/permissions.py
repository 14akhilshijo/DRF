"""
Custom permissions for the Asset Management System API.
"""
from rest_framework import permissions


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admins to edit objects.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.is_admin


class IsAdminOrTechnician(permissions.BasePermission):
    """
    Custom permission for admin and technician access.
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            (request.user.is_admin or request.user.is_technician)
        )


class IsOwnerOrAdminOrTechnician(permissions.BasePermission):
    """
    Custom permission to allow owners, admins, and technicians to access objects.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Admin and technicians have full access
        if request.user.is_admin or request.user.is_technician:
            return True
        
        # Check if user is the owner of the object
        if hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        elif hasattr(obj, 'assigned_to'):
            return obj.assigned_to == request.user
        
        return False


class TicketPermission(permissions.BasePermission):
    """
    Custom permission for ticket operations.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # All authenticated users can create tickets
        if request.method == 'POST':
            return True
        
        # Admin and technicians can view all tickets
        if request.user.is_admin or request.user.is_technician:
            return True
        
        # Regular users can only view their own tickets
        return request.method in permissions.SAFE_METHODS

    def has_object_permission(self, request, view, obj):
        # Admin and technicians have full access
        if request.user.is_admin or request.user.is_technician:
            return True
        
        # Users can only access their own tickets
        return obj.created_by == request.user