from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from .models import Bookmark
from .serializers import BookmarkSerializer


# -----------------------------
# Utility responses (consistent format)
# -----------------------------
def success_response(data=None, message="Success", code=status.HTTP_200_OK):
    return Response(
        {"success": True, "data": data or {}, "message": message, "errors": {}},
        status=code,
    )


def error_response(message="Error", errors=None, code=status.HTTP_400_BAD_REQUEST):
    return Response(
        {"success": False, "data": {}, "message": message, "errors": errors or {}},
        status=code,
    )


# -----------------------------
# LIST + CREATE Bookmarks
# -----------------------------
class BookmarkListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """
        ✅ List all bookmarks for the logged-in user
        """
        bookmarks = Bookmark.objects.filter(user=request.user)
        serializer = BookmarkSerializer(bookmarks, many=True)
        return success_response(serializer.data, "Bookmarks fetched successfully")

    def post(self, request):
        """
        ✅ Create a new bookmark for the logged-in user
        """
        serializer = BookmarkSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            bookmark = serializer.save()
            return success_response(
                BookmarkSerializer(bookmark).data,
                "Bookmark created successfully",
                code=status.HTTP_201_CREATED,
            )
        return error_response("Validation error", serializer.errors)


# -----------------------------
# DELETE Bookmark
# -----------------------------
class BookmarkDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        """
        ✅ Remove a bookmark by its ID
        """
        bookmark = Bookmark.objects.filter(pk=pk, user=request.user).first()
        if not bookmark:
            return error_response("Bookmark not found", code=status.HTTP_404_NOT_FOUND)

        bookmark.delete()
        return success_response(
            {"id": pk},
            "Bookmark removed successfully",
            code=status.HTTP_200_OK,
        )
