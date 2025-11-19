from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.pagination import PageNumberPagination
from .models import Category
from .serializers import CategorySerializer
from blog.models import Article
from blog.serializers import ArticleSerializer

# ------------------------
# Create Category (Admin Only)
# ------------------------
class CategoryCreateAPIView(APIView):
    """
    Create a new category (Admin only).
    """
    # permission_classes = [permissions.IsAdminUser]  # Only admin can access

    def post(self, request):
        try:
            serializer = CategorySerializer(data=request.data)
            if serializer.is_valid():
                category = serializer.save()
                return Response(
                    {
                        "success": True,
                        "message": "Category created successfully",
                        "data": CategorySerializer(category).data,
                        "errors": None
                    },
                    status=status.HTTP_201_CREATED
                )
            
            return Response(
                {
                    "success": False,
                    "message": "Validation error",
                    "errors": serializer.errors,
                    "data": None
                },
                status=status.HTTP_400_BAD_REQUEST
            )
            
        except Exception as e:
            return Response(
                {
                    "success": False,
                    "message": "Internal server error",
                    "errors": {"server": str(e)},
                    "data": None
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# ------------------------
# Get Articles by Category ID
# ------------------------
class ArticlesByCategoryAPIView(APIView):
    """
    Get all articles by category ID
    """
    def get(self, request, category_id):
        try:
            # Check if category exists
            try:
                category = Category.objects.get(id=category_id)
            except Category.DoesNotExist:
                return Response(
                    {
                        "success": False,
                        "message": "Category not found",
                        "errors": {"category": "Category with this ID does not exist"},
                        "data": None
                    },
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Get published articles by category
            articles = Article.objects.filter(
                category_id=category_id,
                is_published=True,
                is_deleted=False
            ).select_related('author', 'category').order_by('-created_at')
            
            # Pagination
            paginator = PageNumberPagination()
            paginator.page_size = 10
            result_page = paginator.paginate_queryset(articles, request)
            
            serializer = ArticleSerializer(result_page, many=True)
            
            # Build paginated response
            paginated_data = paginator.get_paginated_response(serializer.data).data
            
            return Response(
                {
                    "success": True,
                    "message": f"Articles retrieved successfully for category '{category.name}'",
                    "data": {
                        "category": {
                            "id": category.id,
                            "name": category.name,
                            "description": getattr(category, 'description', '')
                        },
                        "articles": paginated_data
                    },
                    "errors": None
                },
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            return Response(
                {
                    "success": False,
                    "message": "Internal server error",
                    "errors": {"server": str(e)},
                    "data": None
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# ------------------------
# Get Articles by Category Slug
# ------------------------
class ArticlesByCategorySlugAPIView(APIView):
    """
    Get all articles by category slug/name
    """
    def get(self, request, category_slug):
        try:
            # First get the category by slug/name
            category = Category.objects.filter(
                name__iexact=category_slug.replace('-', ' ')
            ).first()
            
            if not category:
                return Response(
                    {
                        "success": False,
                        "message": "Category not found",
                        "errors": {"category": f"Category '{category_slug}' does not exist"},
                        "data": None
                    },
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Get published articles by category
            articles = Article.objects.filter(
                category=category,
                is_published=True,
                is_deleted=False
            ).select_related('author', 'category').order_by('-created_at')
            
            # Pagination
            paginator = PageNumberPagination()
            paginator.page_size = 10
            result_page = paginator.paginate_queryset(articles, request)
            
            serializer = ArticleSerializer(result_page, many=True)
            
            # Build paginated response
            paginated_data = paginator.get_paginated_response(serializer.data).data
            
            return Response(
                {
                    "success": True,
                    "message": f"Articles retrieved successfully for category '{category.name}'",
                    "data": {
                        "category": {
                            "id": category.id,
                            "name": category.name,
                            "description": getattr(category, 'description', '')
                        },
                        "articles": paginated_data
                    },
                    "errors": None
                },
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            return Response(
                {
                    "success": False,
                    "message": "Internal server error",
                    "errors": {"server": str(e)},
                    "data": None
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# ------------------------
# List Categories (Public)
# ------------------------
class CategoryListAPIView(APIView):
    """
    List all active categories.
    """
    permission_classes = [permissions.AllowAny]  # Public endpoint

    def get(self, request):
        try:
            categories = Category.objects.filter(is_active=True).order_by("name")
            serializer = CategorySerializer(categories, many=True)
            
            return Response(
                {
                    "success": True,
                    "message": "Categories retrieved successfully",
                    "data": serializer.data,
                    "errors": None
                },
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            return Response(
                {
                    "success": False,
                    "message": "Internal server error",
                    "errors": {"server": str(e)},
                    "data": None
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )