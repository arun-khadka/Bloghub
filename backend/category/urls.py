from django.urls import path
from .views import (
    ArticlesByCategoryAPIView,
    ArticlesByCategorySlugAPIView,
    CategoryListAPIView,
    CategoryCreateAPIView,
)

urlpatterns = [
    path("list/", CategoryListAPIView.as_view(), name="category-list"),
    path("create/", CategoryCreateAPIView.as_view(), name="category-create"),
    # Get articles by category ID
    path(
        "<int:category_id>/",
        ArticlesByCategoryAPIView.as_view(),
        name="articles-by-category-id",
    ),
    # Get articles by category slug/name
    path(
        "<str:category_slug>/",
        ArticlesByCategorySlugAPIView.as_view(),
        name="articles-by-category-slug",
    ),
]
