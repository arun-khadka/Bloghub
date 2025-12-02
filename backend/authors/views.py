from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Author
from .serializers import AuthorSerializer
from users.serializers import UserProfileSerializer


class AuthorListView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request):
        """List all authors"""
        authors = Author.objects.all()
        serializer = AuthorSerializer(authors, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AuthorCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user

        if hasattr(user, "author_profile"):
            return Response(
                {"error": "Author profile already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = AuthorSerializer(data=request.data)

        if serializer.is_valid():
            author = serializer.save(
                user=user,
                bio=request.data.get("bio", "Hey! Please update your bio."),
                social_links=request.data.get("social_links", {})
            )

            # Mark user as author
            user.is_author = True
            user.save()

            return Response(
                {
                    "success": True,
                    "message": "Author profile created successfully",
                    "data": AuthorSerializer(author).data,
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            {
                "success": False,
                "errors": serializer.errors,
                "message": "Validation failed"
            },
            status=status.HTTP_400_BAD_REQUEST
        )




# -------------------------
# AUTHOR RETRIEVE BY USER ID
# -------------------------
class AuthorRetrieveView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, identifier):
        """
        Retrieve author by:
        1. Author ID (primary key)
        2. User ID
        3. Username
        """
        try:
            # Try to get by author ID first
            author = Author.objects.get(id=identifier)
        except (Author.DoesNotExist, ValueError):
            try:
                # Try by user ID
                author = Author.objects.get(user__id=identifier)
            except (Author.DoesNotExist, ValueError):
                try:
                    # Try by username
                    author = Author.objects.get(user__username=identifier)
                except Author.DoesNotExist:
                    # Check if user exists but doesn't have author profile
                    from django.contrib.auth import get_user_model
                    User = get_user_model()
                    try:
                        user = User.objects.get(id=identifier)
                        return Response(
                            {
                                "success": False,
                                "message": "User exists but has no author profile",
                                "data": None
                            },
                            status=status.HTTP_404_NOT_FOUND
                        )
                    except User.DoesNotExist:
                        try:
                            user = User.objects.get(username=identifier)
                            return Response(
                                {
                                    "success": False,
                                    "message": "User exists but has no author profile",
                                    "data": None
                                },
                                status=status.HTTP_404_NOT_FOUND
                            )
                        except User.DoesNotExist:
                            return Response(
                                {
                                    "success": False,
                                    "message": "Author not found",
                                    "data": None
                                },
                                status=status.HTTP_404_NOT_FOUND
                            )
        
        serializer = AuthorSerializer(author)
        return Response(
            {
                "success": True,
                "data": serializer.data,
                "message": "Author retrieved successfully",
            },
            status=status.HTTP_200_OK,
        )

# -------------------------
# AUTHOR DETAIL BY PK
# -------------------------
class AuthorDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        try:
            author = Author.objects.get(pk=pk)
        except Author.DoesNotExist:
            return Response({"error": "Author not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = AuthorSerializer(author)
        return Response(serializer.data, status=status.HTTP_200_OK)



class AuthorUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk):
        return self.update_author(request, pk, partial=False)

    def patch(self, request, pk):
        return self.update_author(request, pk, partial=True)

    def update_author(self, request, pk, partial):
        try:
            author = Author.objects.get(pk=pk)
        except Author.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "error": "Author not found",
                    "message": "Author profile does not exist"
                }, 
                status=status.HTTP_404_NOT_FOUND
            )

        # Only owner can update
        if request.user != author.user and not request.user.is_staff:
            return Response(
                {
                    "success": False,
                    "error": "Permission denied",
                    "message": "You don't have permission to update this profile"
                }, 
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = AuthorSerializer(author, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "success": True,
                    "data": serializer.data,
                    "message": "Author profile updated successfully"
                },
                status=status.HTTP_200_OK
            )

        return Response(
            {
                "success": False,
                "errors": serializer.errors,
                "message": "Validation failed"
            },
            status=status.HTTP_400_BAD_REQUEST
        )



class AuthorDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        try:
            # Try to get by author ID first
            author = Author.objects.get(pk=pk)
        except Author.DoesNotExist:
            # Try to get by user ID
            try:
                author = Author.objects.get(user__id=pk)
            except Author.DoesNotExist:
                return Response(
                    {
                        "success": False,
                        "error": "Author not found",
                        "message": "Author profile does not exist"
                    },
                    status=status.HTTP_404_NOT_FOUND
                )

        # Only owner can delete
        if request.user != author.user and not request.user.is_staff:
            return Response(
                {
                    "success": False,
                    "error": "Permission denied",
                    "message": "You don't have permission to delete this profile"
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # Mark user as not an author
        author.user.is_author = False
        author.user.save()
        
        author.delete()
        
        return Response(
            {
                "success": True,
                "message": "Author profile deleted successfully",
                "data": None
            },
            status=status.HTTP_200_OK
        )