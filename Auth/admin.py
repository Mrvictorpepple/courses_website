from django.contrib import admin
from .models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

class UserAdmin(BaseUserAdmin):
    fieldsets = (
        (None, {'fields': ('email','password', 'first_name', 'last_name','phone_number','last_login',)}),
        ('Permissions',{'fields':(
            'is_active',
            'is_staff',
            'is_superuser',
            'groups',
            'user_permissions',
        )}),
        )
    add_fieldsets = (
        (None,{
            'classes':('wide',),
            'fields':('email','password1','password2')
        }),
    )
    list_display = ('email', 'first_name','last_name','is_staff', 'last_login',)
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups',)
    search_fields = ('email','phone_number')
    ordering = ('email',)
    filter_horizontal = ('groups','user_permissions',)

admin.site.register(User, UserAdmin)
