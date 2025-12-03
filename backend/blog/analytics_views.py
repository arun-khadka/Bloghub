import calendar
from rest_framework.views import APIView
from rest_framework import status, permissions
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Sum, Avg
from blog.models import Article
from blog.serializers import ArticleSerializer
from authors.models import Author
from datetime import timedelta


from django.db.models import Sum, Avg
from django.utils import timezone
from datetime import timedelta
import calendar

class ViewAnalyticsAPIView(APIView):
    # permission_classes = [permissions.IsAdminUser]
    
    def get(self, request):
        try:
            # Get time range from query params (default to 'monthly')
            time_range = request.GET.get('time_range', 'monthly')  # daily, weekly, monthly
            
            # Base queryset for all-time data
            all_articles = Article.objects.filter(is_deleted=False)
            
            # 1. KPI Metrics (All-time) - ALWAYS return these
            total_views = all_articles.aggregate(total=Sum("view_count"))["total"] or 0
            avg_views = all_articles.aggregate(avg=Avg("view_count"))["avg"] or 0
            
            # 2. Most/Least Viewed Articles (All-time) - ALWAYS return these
            most_viewed = all_articles.order_by("-view_count")[:5]
            least_viewed = all_articles.order_by("view_count")[:5]
            
            # 3. Time-based data - SIMPLIFY to match frontend expectations
            # Frontend expects: last 7 days for daily, last 4 weeks for weekly, last 6 months for monthly
            chart_data = []
            time_range_kpis = {}
            
            if time_range == 'daily':
                chart_data, time_range_kpis = self.get_simple_daily_data(all_articles)
            elif time_range == 'weekly':
                chart_data, time_range_kpis = self.get_simple_weekly_data(all_articles)
            else:  # monthly
                chart_data, time_range_kpis = self.get_simple_monthly_data(all_articles)
            
            data = {
                # All-time data - ALWAYS include
                "total_views": total_views,
                "average_views": round(avg_views, 2),
                "most_viewed": ArticleSerializer(most_viewed, many=True).data,
                "least_viewed": ArticleSerializer(least_viewed, many=True).data,
                
                # Time-based data
                "chart_data": chart_data,
                "time_range_kpis": time_range_kpis,
                "time_range": time_range,
            }
            
            return Response(data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get_simple_daily_data(self, queryset):
        """Get simple daily data for last 7 days"""
        end_date = timezone.now()
        start_date = end_date - timedelta(days=6)  # Last 7 days
        
        # Get articles published in the last 7 days
        recent_articles = queryset.filter(
            created_at__date__range=[start_date.date(), end_date.date()]
        )
        
        # Calculate total views for period
        period_views = recent_articles.aggregate(total=Sum('view_count'))['total'] or 0
        period_articles = recent_articles.count()
        period_avg = period_views / period_articles if period_articles > 0 else 0
        
        # Generate chart data for each day
        chart_data = []
        
        for i in range(7):
            target_date = start_date.date() + timedelta(days=i)
            day_label = target_date.strftime('%a')  # Mon, Tue, Wed, etc.
            
            # Get articles published on this specific day
            daily_articles = queryset.filter(created_at__date=target_date)
            daily_views = daily_articles.aggregate(total=Sum('view_count'))['total'] or 0
            daily_count = daily_articles.count()
            
            chart_data.append({
                "date": target_date.strftime('%Y-%m-%d'),
                "day": day_label,
                "label": day_label,
                "views": daily_views,
                "articles": daily_count,
            })
        
        time_range_kpis = {
            "total_views_in_period": period_views,
            "avg_views_in_period": round(period_avg, 2),
            "articles_published_in_period": period_articles,
            "period_start": start_date,
            "period_end": end_date,
        }
        
        return chart_data, time_range_kpis
    
    def get_simple_weekly_data(self, queryset):
        """Get simple weekly data for last 4 weeks"""
        end_date = timezone.now()
        start_date = end_date - timedelta(weeks=3)  # Last 4 weeks
        
        # Get articles published in the last 4 weeks
        recent_articles = queryset.filter(
            created_at__range=[start_date, end_date]
        )
        
        # Calculate total views for period
        period_views = recent_articles.aggregate(total=Sum('view_count'))['total'] or 0
        period_articles = recent_articles.count()
        period_avg = period_views / period_articles if period_articles > 0 else 0
        
        # Generate chart data for each week
        chart_data = []
        
        for week_num in range(4):
            week_start = start_date + timedelta(weeks=week_num)
            week_end = week_start + timedelta(days=6)
            
            if week_end > end_date:
                week_end = end_date
            
            # Get articles published in this week
            weekly_articles = queryset.filter(
                created_at__range=[week_start, week_end]
            )
            weekly_views = weekly_articles.aggregate(total=Sum('view_count'))['total'] or 0
            weekly_count = weekly_articles.count()
            
            chart_data.append({
                "week_number": week_num + 1,
                "label": f"Week {week_num + 1}",
                "start_date": week_start.date().strftime('%Y-%m-%d'),
                "end_date": week_end.date().strftime('%Y-%m-%d'),
                "views": weekly_views,
                "articles": weekly_count,
            })
        
        time_range_kpis = {
            "total_views_in_period": period_views,
            "avg_views_in_period": round(period_avg, 2),
            "articles_published_in_period": period_articles,
            "period_start": start_date,
            "period_end": end_date,
        }
        
        return chart_data, time_range_kpis
    
    def get_simple_monthly_data(self, queryset):
        """Get simple monthly data for last 6 months"""
        end_date = timezone.now()
        start_date = end_date - timedelta(days=180)  # Last 6 months
        
        # Get articles published in the last 6 months
        recent_articles = queryset.filter(
            created_at__range=[start_date, end_date]
        )
        
        # Calculate total views for period
        period_views = recent_articles.aggregate(total=Sum('view_count'))['total'] or 0
        period_articles = recent_articles.count()
        period_avg = period_views / period_articles if period_articles > 0 else 0
        
        # Generate chart data for each month
        chart_data = []
        current_date = start_date.replace(day=1)
        
        for i in range(6):
            month_start = current_date
            month_end = month_start + timedelta(days=calendar.monthrange(
                month_start.year, month_start.month
            )[1] - 1)
            
            if month_end > end_date:
                month_end = end_date
            
            # Get articles published in this month
            monthly_articles = queryset.filter(
                created_at__range=[month_start, month_end]
            )
            monthly_views = monthly_articles.aggregate(total=Sum('view_count'))['total'] or 0
            monthly_count = monthly_articles.count()
            
            month_label = month_start.strftime('%b')  # Jan, Feb, etc.
            
            chart_data.append({
                "month": month_start.strftime('%Y-%m'),
                "label": month_label,
                "month_name": month_start.strftime('%B'),
                "year": month_start.year,
                "views": monthly_views,
                "articles": monthly_count,
            })
            
            # Move to next month
            if month_start.month == 12:
                current_date = month_start.replace(year=month_start.year + 1, month=1)
            else:
                current_date = month_start.replace(month=month_start.month + 1)
        
        time_range_kpis = {
            "total_views_in_period": period_views,
            "avg_views_in_period": round(period_avg, 2),
            "articles_published_in_period": period_articles,
            "period_start": start_date,
            "period_end": end_date,
        }
        
        return chart_data, time_range_kpis


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
    permission_classes = [permissions.IsAdminUser]

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
    permission_classes = [permissions.IsAdminUser]

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
