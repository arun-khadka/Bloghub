from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    model = User

    # Fields shown in admin list table
    list_display = ("email", "fullname", "is_admin", "is_author", "is_active")
    list_filter = ("is_admin", "is_author", "is_active")
    search_fields = ("email", "fullname")
    ordering = ("email",)

    # Fields when editing a user
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (_("Personal info"), {"fields": ("fullname",)}),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_admin",
                    "is_author",
                    "groups",
                    "user_permissions",
                )
            },
        ),
    )

    # Fields when creating a new user
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "fullname",
                    "password1",
                    "password2",
                    "is_active",
                    "is_admin",
                    "is_author",
                ),
            },
        ),
    )
