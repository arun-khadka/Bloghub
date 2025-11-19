from rest_framework import serializers
from .models import Author
from users.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'fullname', 'email']

class AuthorSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = Author
        fields = [
            'id', 
            'user', 
            'user_details',  # This will include all user data
            'bio', 
            'social_links', 
            'created_at', 
            'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']