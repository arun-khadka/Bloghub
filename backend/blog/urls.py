from django.urls import path
from .views import (
    ArticleCreateView,
    ArticleDeleteByIdView,
    ArticleDetailView,
    ArticleListView,
    ArticleRetrieveView,
    ArticleSearchView,
    ArticleUpdateView,
    ArticlesByAuthorView,
    IncrementArticleViews,
    LatestArticlesView,
    MyArticlesView,
)

urlpatterns = [
    # Article creation, retrieval, update, delete
    path("create/", ArticleCreateView.as_view(), name="article-create"),
    # My Articles
    path("my-articles/", MyArticlesView.as_view(), name="my-articles"),
    # SEARCH AND LIST ARTICLES
    path("search/", ArticleSearchView.as_view(), name="article-search"),
    path("list/", ArticleListView.as_view(), name="article-list"),
    path("latest/", LatestArticlesView.as_view(), name="latest-articles"),
    # Articles by author
    path(
        "author/<int:author_id>/",
        ArticlesByAuthorView.as_view(),
        name="articles-by-author",
    ),
    # Article operations by ID
    path("retrieve/<int:id>/", ArticleRetrieveView.as_view(), name="article-retrieve"),
    path(
        "<int:article_id>/increment-views/",
        IncrementArticleViews.as_view(),
        name="increment-article-views",
    ),
    # Update & Delete by ID
    path("update/<int:article_id>/", ArticleUpdateView.as_view(), name="article-update"),
    path("delete/<int:id>/", ArticleDeleteByIdView.as_view(), name="article-delete"),
    path("<slug:slug>/", ArticleDetailView.as_view(), name="article-detail-slug"),
]
