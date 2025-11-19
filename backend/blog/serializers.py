from rest_framework import serializers
from .models import Article
from category.models import Category


class ArticleSerializer(serializers.ModelSerializer):
    # Author is read-only, assigned in view
    author = serializers.PrimaryKeyRelatedField(read_only=True)
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), required=False
    )
    # Add category_name field to get the category name
    category_name = serializers.CharField(source="category.name", read_only=True)
    author_name = serializers.CharField(source="author.user.fullname", read_only=True)

    class Meta:
        model = Article
        fields = [
            "id",
            "title",
            "slug",
            "content",
            "excerpt",
            "featured_image",
            "author",
            "author_name",
            "category",
            "category_name",
            "view_count",
            "created_at",
            "updated_at",
            "is_published",
            "is_deleted",
        ]
        read_only_fields = ["slug", "created_at", "updated_at", "view_count", "author"]

    def create(self, validated_data):
        # Ensure category exists if provided
        category = validated_data.get("category", None)
        if category and not Category.objects.filter(id=category.id).exists():
            raise serializers.ValidationError({"category": "Invalid category ID"})
        return super().create(validated_data)
