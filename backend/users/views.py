from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import RegisterSerializer, LoginSerializer, UserProfileSerializer
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
