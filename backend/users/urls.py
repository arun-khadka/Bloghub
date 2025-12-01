from django.urls import path
from .views import (
    AdminDashboardView,
    AdminLoginView,
    AdminUserDeleteView,
    AdminUserUpdateView,
    RegisterView,
    LoginView,
    ProfileView,
    UserListView,
)

urlpatterns = [
    # Auth endpoints
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("admin/login/", AdminLoginView.as_view(), name="admin-login"),
    path("profile/", ProfileView.as_view(), name="profile"),
    
    # Admin user management endpoints
    path("admin/users/", UserListView.as_view(), name="admin-users-list"),
    
    path(
        "admin/users/update/<int:user_id>/",
        AdminUserUpdateView.as_view(),
        name="admin-user-update",
    ),

    path(
        "admin/users/delete/<int:user_id>/",
        AdminUserDeleteView.as_view(),
        name="admin-user-delete",
    ),

    path("admin/dashboard/", AdminDashboardView.as_view(), name="admin-dashboard"),
]
