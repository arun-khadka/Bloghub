from django.urls import path
from .views import CommentDetailView, CommentView, ReplyView, LikeCommentView

urlpatterns = [
    path('<int:article_id>/comments/', CommentView.as_view(), name='article-comments'),
    path('<int:comment_id>/reply/', ReplyView.as_view(), name='comment-reply'),
    path('<int:comment_id>/like/', LikeCommentView.as_view(), name='comment-like'),
    path('comments/<int:comment_id>/', CommentDetailView.as_view(), name='comment-detail'),

]
