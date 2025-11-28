from django.urls import path
from .views import (
    ArticlesByCategoryAPIView,
    ArticlesByCategorySlugAPIView,
    CategoryDeleteAPIView,
    CategoryListAPIView,
    CategoryCreateAPIView,
    CategoryUpdateAPIView,
)

urlpatterns = [
    path("list/", CategoryListAPIView.as_view(), name="category-list"),
    path("create/", CategoryCreateAPIView.as_view(), name="category-create"),
    path("update/<int:pk>/", CategoryUpdateAPIView.as_view(), name="category-update"),
    path("delete/<int:pk>/", CategoryDeleteAPIView.as_view(), name="category-delete"),
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
