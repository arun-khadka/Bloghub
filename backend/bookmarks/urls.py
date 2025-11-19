from django.urls import path
from .views import BookmarkListCreateView, BookmarkDeleteView

urlpatterns = [
    path(
        "create-list/", BookmarkListCreateView.as_view(), name="bookmark-list-create"
    ),  # GET = list, POST = create
    path(
        "<int:pk>/delete/", BookmarkDeleteView.as_view(), name="bookmark-delete"
    ),  # DELETE by ID
]
