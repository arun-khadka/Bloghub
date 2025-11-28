from django.db.models import Q
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import User
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    AdminLoginSerializer,
    RegisterSerializer,
    LoginSerializer,
    UserListSerializer,
    UserProfileSerializer,
)
from core.utils.responses import success_response, error_response


def get_tokens_for_user(user):
    """Generate JWT tokens for user"""
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


# User Login View
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response("Invalid credentials", serializer.errors)

        user = serializer.validated_data["user"]
        tokens = get_tokens_for_user(user)
        data = {
            "user": UserProfileSerializer(user).data,
            "tokens": tokens,
        }
        return success_response(data, "Login successful", status.HTTP_200_OK)


# Admin Login View - Only allows admin users
class AdminLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = AdminLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response("Invalid credentials", serializer.errors)

        user = serializer.validated_data["user"]
        tokens = get_tokens_for_user(user)
        data = {
            "user": UserProfileSerializer(user).data,
            "tokens": tokens,
        }
        return success_response(data, "Admin login successful", status.HTTP_200_OK)


# User Registration View
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response("Validation error", serializer.errors)

        user = serializer.save()
        data = {"user": UserProfileSerializer(user).data}
        return success_response(
            data, "Registration successful", status.HTTP_201_CREATED
        )


# User Profile View
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserProfileSerializer(user)
        return success_response(serializer.data, "Profile fetched successfully")

    def put(self, request):
        user = request.user
        serializer = UserProfileSerializer(user, data=request.data, partial=True)
        if not serializer.is_valid():
            return error_response("Validation error", serializer.errors)
        serializer.save()
        return success_response(serializer.data, "Profile updated successfully")


class UserListView(APIView):
    # permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        try:
            # Get query parameters for filtering
            search = request.GET.get("search", "")
            role = request.GET.get("role", "all")
            status_filter = request.GET.get("status", "all")

            # Start with all users
            users = User.objects.all()

            # Apply search filter
            if search:
                users = users.filter(
                    Q(fullname__icontains=search) | Q(email__icontains=search)
                )

            # Apply role filter
            if role != "all":
                if role == "admin":
                    users = users.filter(is_admin=True)
                elif role == "author":
                    # Users who have author_profile
                    users = users.filter(is_author=True)
                elif role == "reader":
                    # Users who are not admin and not author
                    users = users.filter(is_admin=False, is_author=False)

            # Apply status filter
            if status_filter != "all":
                if status_filter == "active":
                    users = users.filter(is_active=True)
                elif status_filter == "suspended":
                    users = users.filter(is_active=False)

            # Order by most recent
            users = users.order_by("-date_joined")

            # Serialize data
            serializer = UserListSerializer(users, many=True)

            # Get counts for frontend
            total_count = users.count()
            active_count = User.objects.filter(is_active=True).count()
            authors_count = User.objects.filter(is_author=True).count()
            admin_count = User.objects.filter(is_admin=True).count()
            readers_count = User.objects.filter(is_admin=False, is_author=False).count()

            return Response(
                {
                    "success": True,
                    "message": "Users retrieved successfully",
                    "data": serializer.data,
                    "count": total_count,
                    "stats": {
                        "total": User.objects.count(),
                        "active": active_count,
                        "authors": authors_count,
                        "admins": admin_count,
                        "readers": readers_count,
                    },
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {
                    "success": False,
                    "message": "Error retrieving users",
                    "error": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# Admin User Update View
class AdminUserUpdateView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def put(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)

            # Update basic fields
            if "fullname" in request.data:
                user.fullname = request.data["fullname"]

            if "email" in request.data:
                user.email = request.data["email"]

            # Handle role changes
            if "role" in request.data:
                role = request.data["role"]
                if role == "admin":
                    user.is_admin = True
                    user.is_author = False
                elif role == "author":
                    user.is_admin = False
                    user.is_author = True
                elif role == "reader":
                    user.is_admin = False
                    user.is_author = False

            # Handle status changes
            if "status" in request.data:
                user.is_active = request.data["status"] == "active"

            user.save()

            # Return updated user data
            serializer = UserListSerializer(user)
            return success_response(
                serializer.data, "User updated successfully", status.HTTP_200_OK
            )

        except User.DoesNotExist:
            return error_response("User not found", status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return error_response(
                f"Error updating user: {str(e)}",
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# Admin User Delete View
class AdminUserDeleteView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def delete(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)

            # Prevent admin from deleting themselves
            if user.id == request.user.id:
                return error_response(
                    "Cannot delete your own account", status=status.HTTP_400_BAD_REQUEST
                )

            user.delete()
            return success_response(
                None, "User deleted successfully", status.HTTP_200_OK
            )

        except User.DoesNotExist:
            return error_response("User not found", status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return error_response(
                f"Error deleting user: {str(e)}",
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# Admin Dashboard Stats View
class AdminDashboardView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        try:
            total_users = User.objects.count()
            active_users = User.objects.filter(is_active=True).count()
            admin_users = User.objects.filter(is_admin=True).count()
            author_users = User.objects.filter(is_author=True).count()
            reader_users = User.objects.filter(is_admin=False, is_author=False).count()

            # Recent users (last 7 days)
            from django.utils import timezone
            from datetime import timedelta

            week_ago = timezone.now() - timedelta(days=7)
            recent_users = User.objects.filter(date_joined__gte=week_ago).count()

            stats = {
                "total_users": total_users,
                "active_users": active_users,
                "admin_users": admin_users,
                "author_users": author_users,
                "reader_users": reader_users,
                "recent_users": recent_users,
            }

            return success_response(stats, "Dashboard stats retrieved successfully")

        except Exception as e:
            return error_response(
                f"Error retrieving dashboard stats: {str(e)}",
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
