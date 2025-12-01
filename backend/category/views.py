from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from rest_framework.pagination import PageNumberPagination
from .models import Category
from .serializers import CategorySerializer
from blog.models import Article
from blog.serializers import ArticleSerializer

# ------------------------
# Create Category (Admin Only)
# ------------------------
class CategoryCreateAPIView(APIView):

    # permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        try:
            name = request.data.get("name", "").strip()

            # ---- Duplicate Category Validation ----
            if Category.objects.filter(name__iexact=name).exists():
                return Response(
                    {
                        "success": False,
                        "message": "Category already exists.",
                        "errors": {"name": ["A category with this name already exists."]},
                        "data": None
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Serialize & Save
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
# Update Category (Admin Only)
# ------------------------
class CategoryUpdateAPIView(APIView):
    
    # permission_classes = [permissions.IsAdminUser]

    def put(self, request, pk):
        try:
            category = get_object_or_404(Category, pk=pk)

            serializer = CategorySerializer(category, data=request.data, partial=False)
            if serializer.is_valid():
                serializer.save()
                return Response(
                    {
                        "success": True,
                        "message": "Category updated successfully",
                        "data": serializer.data,
                        "errors": None,
                    },
                    status=status.HTTP_200_OK
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
# Delete Category (Admin Only)
# ------------------------
class CategoryDeleteAPIView(APIView):

    # permission_classes = [permissions.IsAdminUser]

    def delete(self, request, pk):
        try:
            category = get_object_or_404(Category, pk=pk)
            category.delete()

            return Response(
                {
                    "success": True,
                    "message": "Category deleted successfully",
                    "data": None,
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
# Get All Articles by Category ID
# ------------------------
class ArticlesByCategoryAPIView(APIView):

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
# Get Articles by Category Slug/Name
# ------------------------
class ArticlesByCategorySlugAPIView(APIView):

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
class CategoryPagination(PageNumberPagination):
    page_size = 6  # Default items per page
    page_size_query_param = "limit"  # Allow frontend to change limit
    max_page_size = 100


class CategoryListAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            # Fetch active categories
            categories = Category.objects.filter(is_active=True).order_by("name")

            # Add search functionality
            search_query = request.GET.get('search', '')
            if search_query:
                categories = categories.filter(
                    Q(name__icontains=search_query) | 
                    Q(icon_name__icontains=search_query)
                )

            # Pagination
            paginator = CategoryPagination()
            paginated_categories = paginator.paginate_queryset(categories, request)
            serializer = CategorySerializer(paginated_categories, many=True)

            return paginator.get_paginated_response({
                "success": True,
                "message": "Categories retrieved successfully",
                "data": serializer.data,
                "errors": None
            })

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


# For all categories (dropdowns, forms)
class CategoryDropdownAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            categories = Category.objects.filter(is_active=True).order_by("name")
            serializer = CategorySerializer(categories, many=True)
            
            return Response({
                "success": True,
                "message": "All categories retrieved successfully",
                "data": serializer.data,
                "errors": None
            })
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