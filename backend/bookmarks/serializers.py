from rest_framework import serializers
from .models import Bookmark

class BookmarkSerializer(serializers.ModelSerializer):
    article_title = serializers.ReadOnlyField(source="article.title")

    class Meta:
        model = Bookmark
        fields = ["id", "user", "article", "article_title", "created_at"]
        read_only_fields = ["user", "created_at"]

    def validate(self, attrs):
        user = self.context["request"].user
        article = attrs["article"]
        if Bookmark.objects.filter(user=user, article=article).exists():
            raise serializers.ValidationError("You have already bookmarked this article.")
        return attrs

    def create(self, validated_data):
        user = self.context["request"].user
        validated_data["user"] = user
        return super().create(validated_data)
