from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    model = User

    # Fields to display in the user list page
    list_display = ("email", "fullname", "is_admin", "is_active")
    list_filter = ("is_admin", "is_active")
    search_fields = ("email", "fullname")
    ordering = ("email",)

    # Fields for editing a user
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (_("Personal info"), {"fields": ("fullname",)}),
        (_("Permissions"), {"fields": ("is_active", "is_admin", "is_superuser", "groups", "user_permissions")})
    )

    # Fields for creating a new user in admin
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "fullname", "password1", "password2", "is_active", "is_admin"),
        }),
    )
