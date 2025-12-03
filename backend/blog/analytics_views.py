from rest_framework.views import APIView
from rest_framework import status, permissions
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Sum, Avg
from blog.models import Article
from blog.serializers import ArticleSerializer
from authors.models import Author
from users.models import User
from datetime import timedelta


class ViewAnalyticsAPIView(APIView):
    # permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        try:
            queryset = Article.objects.filter(is_deleted=False)

            total_views = queryset.aggregate(total=Sum("view_count"))["total"] or 0
            avg_views = queryset.aggregate(avg=Avg("view_count"))["avg"] or 0

            most_viewed = queryset.order_by("-view_count")[:5]
            least_viewed = queryset.order_by("view_count")[:5]

            data = {
                "total_views": total_views,
                "average_views": round(avg_views, 2),
                "most_viewed": ArticleSerializer(most_viewed, many=True).data,
                "least_viewed": ArticleSerializer(least_viewed, many=True).data,
            }

            return Response(data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TrendingArticlesAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            week_ago = timezone.now() - timedelta(days=7)

            trending_articles = Article.objects.filter(
                created_at__gte=week_ago,
                is_deleted=False,
                is_published=True
            ).order_by("-view_count")[:10]

            serializer = ArticleSerializer(trending_articles, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RecentActivityAPIView(APIView):
    # permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        try:
            last_48_hours = timezone.now() - timedelta(hours=48)

            recent_articles = Article.objects.filter(
                created_at__gte=last_48_hours,
                is_deleted=False
            ).order_by("-created_at")

            serializer = ArticleSerializer(recent_articles, many=True)

            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AuthorPerformanceAPIView(APIView):
    # permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        try:
            authors = Author.objects.all()

            data = []

            for author in authors:
                articles = author.articles.filter(is_deleted=False)

                total_articles = articles.count()
                total_views = articles.aggregate(total=Sum("view_count"))["total"] or 0
                avg_views = total_views / total_articles if total_articles else 0

                data.append({
                    "author_id": author.id,
                    "author_name": author.user.fullname,
                    "total_articles": total_articles,
                    "total_views": total_views,
                    "avg_views": round(avg_views, 2),
                })

            return Response(data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
