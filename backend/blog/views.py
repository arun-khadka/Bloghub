from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.db.models import F, Q
from django.db.models import Sum
from django.shortcuts import get_object_or_404

from category.models import Category
from .models import Article
from authors.models import Author
from .serializers import ArticleSerializer


def success_response(data, message="Success", code=status.HTTP_200_OK):
    return Response(
        {"success": True, "data": data, "message": message, "errors": {}}, status=code
    )


def error_response(message="Error", errors=None, code=status.HTTP_400_BAD_REQUEST):
    return Response(
        {"success": False, "data": {}, "message": message, "errors": errors or {}},
        status=code,
    )


# -------------------------
# ARTICLE CREATE
# -------------------------
class ArticleCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        # Only allow Authors or Admins
        author = None
        try:
            author = Author.objects.get(user=user)
        except Author.DoesNotExist:
            if not user.is_admin:
                return error_response(
                    "Only authors or admin can create articles",
                    code=status.HTTP_403_FORBIDDEN,
                )

        serializer = ArticleSerializer(data=request.data)
        if serializer.is_valid():
            article = serializer.save(author=author) if author else serializer.save()
            return success_response(
                ArticleSerializer(article).data,
                "Article created successfully",
                code=status.HTTP_201_CREATED,
            )

        return error_response("Validation error", serializer.errors)


# -------------------------
# MY ARTICLES (Articles by current user)
# -------------------------
class MyArticlesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        try:
            # Get the author profile for the current user
            author = Author.objects.get(user=request.user)
        except Author.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "data": [],
                    "message": "Author profile not found",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Get all articles by this author (including drafts)
        articles = Article.objects.filter(author=author, is_deleted=False).order_by(
            "-created_at"
        )

        serializer = ArticleSerializer(articles, many=True)

        return Response(
            {
                "success": True,
                "data": {"results": serializer.data, "count": articles.count()},
                "message": "Your articles retrieved successfully",
            },
            status=status.HTTP_200_OK,
        )


# -------------------------
# ARTICLE RETRIEVE BY ID
# -------------------------
class ArticleRetrieveView(APIView):
    permission_classes = [permissions.AllowAny]  # Anyone can view

    def get(self, request, id):
        # Fetch the article by ID and ensure it's not deleted
        article = get_object_or_404(Article, id=id, is_deleted=False)

        serializer = ArticleSerializer(article)
        return Response(
            {
                "success": True,
                "data": serializer.data,
                "message": "Article retrieved successfully",
                "errors": {},
            },
            status=status.HTTP_200_OK,
        )


# -------------------------
# ARTICLES BY AUTHOR
# -------------------------
class ArticlesByAuthorView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, author_id):

        try:
            # Check if author exists
            author = Author.objects.get(id=author_id)

        except Author.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "data": [],
                    "message": "Author not found",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Get published articles by this author
        articles = Article.objects.filter(author=author, is_published=True).order_by(
            "-created_at"
        )

        serializer = ArticleSerializer(articles, many=True)

        return Response(
            {
                "success": True,
                "data": serializer.data,
                "message": "Articles retrieved successfully",
                "count": articles.count(),
                "author_id": author_id,
            },
            status=status.HTTP_200_OK,
        )


# -------------------------
# LIST ALL PUBLISHED ARTICLES
# -------------------------
class ArticlePagination(PageNumberPagination):
    page_size = 10  # Default items per page
    page_size_query_param = "limit"  # Allow frontend to change limit
    max_page_size = 100


class ArticleListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        sort = request.GET.get("sort", "date_desc")
        # sort options: views_asc, views_desc, date_asc, date_desc

        # Base query
        articles = Article.objects.filter(is_deleted=False)

        # Apply sorting
        if sort == "views_asc":
            articles = articles.order_by("view_count")
        elif sort == "views_desc":
            articles = articles.order_by("-view_count")
        elif sort == "date_asc":
            articles = articles.order_by("created_at")
        else:  # date_desc (default)
            articles = articles.order_by("-created_at")

        # Pagination
        paginator = ArticlePagination()
        paginated_articles = paginator.paginate_queryset(articles, request)
        serializer = ArticleSerializer(paginated_articles, many=True)

        # ---> Compute total views
        total_views_agg = Article.objects.filter(is_deleted=False).aggregate(
            total_views=Sum("view_count")
        )
        total_views = total_views_agg.get("total_views") or 0

        # Stats
        stats = {
            "total": Article.objects.filter(is_deleted=False).count(),
            "published": Article.objects.filter(
                is_published=True, is_deleted=False
            ).count(),
            "draft": Article.objects.filter(
                is_published=False, is_deleted=False
            ).count(),
            "deleted": Article.objects.filter(is_deleted=True).count(),
            "total_views": total_views,
        }

        return paginator.get_paginated_response(
            {
                "success": True,
                "message": "Articles retrieved successfully",
                "data": serializer.data,
                "stats": stats,
            }
        )


# -------------------------
# LATEST ARTICLES WITH LIMIT
# -------------------------
class LatestArticlesView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # Get limit from query params, default to 10
        limit = int(request.GET.get("limit", 10))

        articles = (
            Article.objects.filter(is_published=True, is_deleted=False)
            .select_related("author", "category")
            .order_by("-created_at")[:limit]
        )

        serializer = ArticleSerializer(articles, many=True)

        return success_response(
            {"articles": serializer.data, "count": articles.count(), "limit": limit},
            "Latest articles retrieved successfully",
        )


# -------------------------
# SEARCH ARTICLES
# -------------------------
class ArticleSearchView(APIView):
    permission_classes = []

    def get(self, request):
        query = request.GET.get("q", "").strip()

        if not query:
            return Response(
                {
                    "success": True,
                    "data": [],
                    "message": "Please provide a search query",
                }
            )

        # Search across multiple fields
        articles = (
            Article.objects.filter(
                Q(title__icontains=query)
                | Q(excerpt__icontains=query)
                | Q(content__icontains=query)
                | Q(category__name__icontains=query)
                | Q(author__user__fullname__icontains=query)
            )
            .filter(is_published=True)
            .order_by("-created_at")
        )

        serializer = ArticleSerializer(articles, many=True)

        return Response(
            {
                "success": True,
                "data": serializer.data,
                "message": f"Found {articles.count()} results for '{query}'",
            }
        )


# -------------------------
# INCREMENT ARTICLE VIEWS
# -------------------------
class IncrementArticleViews(APIView):
    permission_classes = []  # Allow anyone to increment views

    def post(self, request, article_id):
        try:
            article = get_object_or_404(Article, id=article_id)
            article.view_count += 1
            article.save()

            return Response(
                {
                    "success": True,
                    "message": "View count incremented",
                    "view_count": article.view_count,
                },
                status=status.HTTP_200_OK,
            )

        except Article.DoesNotExist:
            return Response(
                {"success": False, "message": "Article not found"},
                status=status.HTTP_404_NOT_FOUND,
            )


# --------------------------------
# ARTICLE UPDATE VIEW
# --------------------------------
class ArticleUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, article_id):
        return self.update_article(request, article_id)

    def patch(self, request, article_id):
        return self.update_article(request, article_id)

    def update_article(self, request, article_id):
        user = request.user

        # 1️⃣ Fetch article
        try:
            article = Article.objects.get(id=article_id, is_deleted=False)
        except Article.DoesNotExist:
            return error_response(
                "Article not found",
                code=status.HTTP_404_NOT_FOUND
            )

        # 2️⃣ Permissions: only admin OR author who created it
        if not user.is_admin:
            try:
                author_profile = Author.objects.get(user=user)
                if article.author != author_profile:
                    return error_response(
                        "You do not have permission to update this article",
                        code=status.HTTP_403_FORBIDDEN
                    )
            except Author.DoesNotExist:
                return error_response(
                    "You do not have permission to update this article",
                    code=status.HTTP_403_FORBIDDEN
                )

        # 3️⃣ Deserialize and validate update
        serializer = ArticleSerializer(article, data=request.data, partial=True)

        if serializer.is_valid():
            # Validate category if provided
            category = serializer.validated_data.get("category")
            if category and not Category.objects.filter(id=category.id).exists():
                return error_response(
                    {"category": "Invalid category ID"},
                    code=status.HTTP_400_BAD_REQUEST
                )

            updated_article = serializer.save()

            return success_response(
                ArticleSerializer(updated_article).data,
                "Article updated successfully"
            )

        return error_response(
            "Validation error",
            serializer.errors,
            code=status.HTTP_400_BAD_REQUEST
        )



# -------------------------
# SOFT DELETE ARTICLE BY ID
# -------------------------
class ArticleDeleteByIdView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, id):
        article = get_object_or_404(Article, id=id, is_deleted=False)

        # Check if user owns the article or is admin
        if article.author.user != request.user and not request.user.is_admin:
            return Response(
                {
                    "success": False,
                    "message": "You do not have permission to delete this article.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # HARD DELETE - completely remove from database
        article_id = article.id
        article.delete()

        return Response(
            {
                "success": True,
                "message": "Article deleted successfully.",
                "data": {"id": article_id},
            },
            status=status.HTTP_200_OK,
        )


# -------------------------
# ARTICLE DETAIL VIEW BY SLUG WITH VIEW COUNT INCREMENT
# -------------------------
class ArticleDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        article = get_object_or_404(
            Article, slug=slug, is_published=True, is_deleted=False
        )

        # Increment view count
        Article.objects.filter(pk=article.pk).update(view_count=F("view_count") + 1)
        article.refresh_from_db()

        serializer = ArticleSerializer(article)
        return Response(
            {
                "success": True,
                "data": serializer.data,
                "message": "Article details fetched successfully.",
            },
            status=status.HTTP_200_OK,
        )
