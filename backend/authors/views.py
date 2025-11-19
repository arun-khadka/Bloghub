from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Author
from .serializers import AuthorSerializer
from users.serializers import UserProfileSerializer


# -------------------------
# AUTHOR LIST AND CREATE
# -------------------------
class AuthorListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request):
        """List all authors"""
        authors = Author.objects.all()
        serializer = AuthorSerializer(authors, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Create a new author profile"""
        user = request.user
        if not user or user.is_anonymous:
            return Response(
                {"error": "Authentication required."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if Author.objects.filter(user=user).exists():
            return Response(
                {"error": "Author profile already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = AuthorSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save(user=user)
                user.is_author = True
                user.save()

                return Response(
                    {
                        "message": "Author profile created successfully",
                        "author": serializer.data,
                        "user": UserProfileSerializer(user).data,
                    },
                    status=status.HTTP_201_CREATED,
                )
            except Exception as e:
                return Response(
                    {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# -------------------------
# AUTHOR RETRIEVE BY USER ID
# -------------------------
class AuthorRetrieveView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, author_id):
        # Try to find by author ID first
        try:
            author = Author.objects.get(id=author_id)
        except Author.DoesNotExist:
            # If not found by author ID, try by user ID
            try:
                author = Author.objects.get(user__id=author_id)
            except Author.DoesNotExist:
                return Response(
                    {"error": "Author not found"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        
        serializer = AuthorSerializer(author)
        return Response(
            {
                "success": True,
                "data": serializer.data,
                "message": "Author retrieved successfully",
                "errors": {},
            },
            status=status.HTTP_200_OK,
        )


# -------------------------
# AUTHOR DETAIL BY PK
# -------------------------
class AuthorDetailView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_object(self, pk):
        try:
            return Author.objects.get(pk=pk)
        except Author.DoesNotExist:
            return None

    def get(self, request, pk):
        author = self.get_object(pk)
        if not author:
            return Response(
                {"error": "Author not found"}, status=status.HTTP_404_NOT_FOUND
            )
        serializer = AuthorSerializer(author)
        return Response(serializer.data)

    def put(self, request, pk):
        """Update author profile"""
        author = self.get_object(pk)
        if not author:
            return Response(
                {"error": "Author not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Only owner can edit their profile
        if request.user != author.user:
            return Response(
                {"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN
            )

        serializer = AuthorSerializer(author, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Delete author profile"""
        author = self.get_object(pk)
        if not author:
            return Response(
                {"error": "Author not found"}, status=status.HTTP_404_NOT_FOUND
            )

        if request.user != author.user:
            return Response(
                {"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN
            )

        author.delete()
        return Response(
            {"message": "Author deleted successfully"},
            status=status.HTTP_204_NO_CONTENT,
        )
