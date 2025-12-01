from django.contrib.auth import authenticate
from rest_framework import serializers
from .models import User
from blog.models import Article 
from authors.models import Author


# --------------------------------
# REGISTER SERIALIZER
# --------------------------------
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


    
# --------------------------------
# LOGIN SERIALIZER
# --------------------------------
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



# --------------------------------
# USER PROFILE SERIALIZER
# --------------------------------
class UserProfileSerializer(serializers.ModelSerializer):
    is_author = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    author_bio = serializers.SerializerMethodField()
    social_links = serializers.SerializerMethodField()

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
            "role",
            "author_bio",
            "social_links",
        ]
        read_only_fields = ["id", "email", "is_active", "is_admin", "date_joined"]

    def get_is_author(self, obj):
        return obj.is_author

    def get_role(self, obj):
        if obj.is_admin:
            return "admin"
        elif obj.is_author:
            return "author"
        return "reader"

    def get_author_bio(self, obj):
        if obj.is_author and hasattr(obj, "author_profile"):
            return obj.author_profile.bio
        return None

    def get_social_links(self, obj):
        if obj.is_author and hasattr(obj, "author_profile"):
            return obj.author_profile.social_links
        return None



# --------------------------------
# USER LIST SERIALIZER
# --------------------------------
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
        if hasattr(obj, 'author_profile'):
            return Article.objects.filter(author=obj.author_profile).count()
        return 0
    
    def get_joined(self, obj):
        return obj.date_joined.strftime("%Y-%m-%d")
    
    def get_is_author(self, obj):
        return obj.is_author



# --------------------------------
# ADMIN LOGIN SERIALIZER
# --------------------------------
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



# --------------------------------
# ADMIN USER UPDATE SERIALIZER
# --------------------------------
class AdminUserUpdateSerializer(serializers.ModelSerializer):
    role = serializers.CharField(required=False, allow_blank=True)
    status = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            "fullname",
            "email",
            "role",    # admin | author | reader
            "status",  # active | suspended
        ]

    def update(self, instance, validated_data):
        # Update fullname
        if "fullname" in validated_data:
            instance.fullname = validated_data["fullname"]

        # Update email
        if "email" in validated_data:
            instance.email = validated_data["email"]

        # Update role
        role = validated_data.get("role")
        if role:
            role = role.lower().strip()

            # ========== ADMIN ==========
            if role == "admin":
                instance.is_admin = True
                instance.is_author = False   
                # Keep author_profile if exists (DO NOT delete)

            # ========== AUTHOR ==========
            elif role == "author":
                instance.is_admin = False
                instance.is_author = True

                # Create author profile only if missing
                if not hasattr(instance, "author_profile"):
                    Author.objects.create(
                        user=instance,
                        bio="Hey! Please update your bio.",
                        social_links={
                            "twitter": "https://twitter.com/",
                            "facebook": "https://facebook.com/"
                        }
                    )

            # ========== READER ==========
            elif role == "reader":
                instance.is_admin = False
                instance.is_author = False   
                # Do NOT delete author_profile

        # Update status
        status_value = validated_data.get("status")
        if status_value:
            instance.is_active = status_value.lower().strip() == "active"

        instance.save()
        return instance
