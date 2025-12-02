from django.urls import path
from .views import (
    AuthorCreateView,
    AuthorDeleteView,
    AuthorDetailView,
    AuthorListView,
    AuthorRetrieveView,
    AuthorUpdateView,
)

urlpatterns = [
    path("list/", AuthorListView.as_view(), name="author-list"),
    path("create/", AuthorCreateView.as_view(), name="author-create"),
    path("<str:identifier>/", AuthorRetrieveView.as_view(), name="author-retrieve"),
    path("<int:pk>/", AuthorDetailView.as_view(), name="author-detail"),
    path("update/<int:pk>/", AuthorUpdateView.as_view(), name="author-update"),
    path("delete/<int:pk>/", AuthorDeleteView.as_view(), name="author-delete"),
]
