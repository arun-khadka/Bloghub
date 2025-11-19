from django.urls import path
from .views import (
    AuthorListCreateView,
    AuthorDetailView,
    AuthorRetrieveView,
)

urlpatterns = [
    path("create/", AuthorListCreateView.as_view(), name="author-list-create"),
    path("<int:author_id>/", AuthorRetrieveView.as_view(), name="author-retrieve"),
    path("<int:pk>/", AuthorDetailView.as_view(), name="author-detail"),
]
