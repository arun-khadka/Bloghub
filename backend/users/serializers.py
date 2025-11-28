from django.contrib.auth import authenticate
from rest_framework import serializers
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ["fullname", "email", "password", "confirm_password"]
        extra_kwargs = {"password": {"write_only": True}}

    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError({"password": "Passwords do not match"})
        return data

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(email=data["email"], password=data["password"])
        if not user:
            raise serializers.ValidationError("Invalid email or password")
        if not user.is_active:
            raise serializers.ValidationError("Account is inactive")
        data["user"] = user
        return data


class UserProfileSerializer(serializers.ModelSerializer):
    is_author = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()


    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "fullname",
            "is_active",
            "is_admin",
            "date_joined",
            "is_author",
            "role" 
        ]
        read_only_fields = ["id", "email", "is_active", "is_admin", "date_joined"]

    def get_is_author(self, obj):
        # Check if an Author profile exists for this user
        return hasattr(obj, "author_profile")
    
    def get_role(self, obj):
        if obj.is_admin:
            return "admin"
        elif obj.is_author:
            return "author"
        else:
            return "reader"


class UserListSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    articles_count = serializers.SerializerMethodField()
    joined = serializers.SerializerMethodField()
    is_author = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 
            'email', 
            'fullname',
            'role',
            'status', 
            'articles_count',
            'joined',
            'is_admin',
            'is_active',
            'date_joined',
            'is_author'
        ]
    
    def get_role(self, obj):
        # Determine role based on user status
        if obj.is_admin:
            return "admin"
        elif obj.is_author:
            return "author"
        else:
            return "reader"
    
    def get_status(self, obj):
        return "active" if obj.is_active else "suspended"
    
    def get_articles_count(self, obj):
        # Assuming you have an Article model with author field
        if hasattr(obj, 'articles'):
            return obj.articles.count()
        return 0
    
    def get_joined(self, obj):
        return obj.date_joined.strftime("%Y-%m-%d")
    
    def get_is_author(self, obj):
        return obj.is_author


class AdminLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(email=data["email"], password=data["password"])
        if not user:
            raise serializers.ValidationError("Invalid email or password")
        if not user.is_active:
            raise serializers.ValidationError("Account is inactive")
        if not user.is_admin:
            raise serializers.ValidationError("You are not authorized to access admin panel")
        data["user"] = user
        return data