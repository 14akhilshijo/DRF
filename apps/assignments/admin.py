from django.contrib import admin
from .models import Assignment


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('asset', 'assigned_to', 'assigned_by', 'assigned_date', 'status')
    list_filter = ('status', 'assigned_date')
    search_fields = ('asset__name', 'assigned_to__email', 'assigned_by__email')
    ordering = ('-assigned_date',)