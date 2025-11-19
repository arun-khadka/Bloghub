from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Comment
from .serializers import CommentSerializer
from blog.models import Article
from django.shortcuts import get_object_or_404


class CommentView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, article_id):
        comments = Comment.objects.filter(article_id=article_id, parent__isnull=True)
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    def post(self, request, article_id):
        user = request.user
        data = request.data
        data["article"] = article_id

        serializer = CommentSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReplyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, comment_id):
        parent_comment = Comment.objects.get(id=comment_id)
        user = request.user

        # only the article's author can reply
        if user != parent_comment.article.author:
            return Response({"detail": "Only the author can reply to comments."},
                            status=status.HTTP_403_FORBIDDEN)

        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=user, article=parent_comment.article, parent=parent_comment)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LikeCommentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, comment_id):
        comment = Comment.objects.get(id=comment_id)
        user = request.user

        if user in comment.likes.all():
            comment.likes.remove(user)
            return Response({"message": "Comment unliked."})
        else:
            comment.likes.add(user)
            return Response({"message": "Comment liked."})


class CommentDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, comment_id):
        """Allow user to update their own comment"""
        comment = get_object_or_404(Comment, id=comment_id)
        user = request.user

        if comment.user != user and not user.is_staff:
            return Response({"detail": "You do not have permission to edit this comment."},
                            status=status.HTTP_403_FORBIDDEN)

        serializer = CommentSerializer(comment, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, comment_id):
        """Allow user to delete their own comment"""
        comment = get_object_or_404(Comment, id=comment_id)
        user = request.user

        if comment.user != user and not user.is_staff:
            return Response({"detail": "You do not have permission to delete this comment."},
                            status=status.HTTP_403_FORBIDDEN)

        comment.delete()
        return Response({"message": "Comment deleted successfully."}, status=status.HTTP_204_NO_CONTENT)