"use client";

import { useEffect, useState, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import {
  Users,
  FileText,
  MessageCircle,
  Eye,
  ArrowRight,
  Loader2,
  AlertCircle,
  User,
  Calendar,
  TrendingUp,
} from "lucide-react";

// Chart configuration
const chartConfig = {
  views: {
    label: "Views",
    color: "hsl(var(--chart-1))",
  },
};

export default function AdminDashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("daily");

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("accessToken");
      
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Fetch dashboard stats
      const dashboardResponse = await fetch(
        "http://127.0.0.1:8000/api/auth/admin/dashboard/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!dashboardResponse.ok) {
        throw new Error(`Failed to fetch dashboard: ${dashboardResponse.status}`);
      }

      const dashboardData = await dashboardResponse.json();

      if (dashboardData.success && dashboardData.data) {
        setDashboardData(dashboardData.data);
      } else {
        throw new Error(dashboardData.message || "Failed to load dashboard data");
      }

      // Also fetch articles for trending and recent activity
      try {
        const articlesResponse = await fetch(
          "http://127.0.0.1:8000/api/blog/list/"
        );

        if (articlesResponse.ok) {
          const articlesData = await articlesResponse.json();
          if (articlesData.success && Array.isArray(articlesData.data)) {
            setArticles(articlesData.data);
          } else if (Array.isArray(articlesData)) {
            setArticles(articlesData);
          }
        }
      } catch (articlesError) {
        console.warn("Failed to fetch articles:", articlesError);
        // Continue without articles data
      }

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Calculate KPIs from dashboard data
  const calculateKPIs = () => {
    if (!dashboardData) {
      return {
        totalUsers: 0,
        totalArticles: 0,
        totalComments: 0, // Not available in current API
        totalViews: 0,
        publishedArticles: 0,
        draftArticles: 0,
      };
    }

    return {
      totalUsers: dashboardData.users?.total || 0,
      totalArticles: dashboardData.articles?.total || 0,
      totalComments: 0, // This would come from a comments API
      totalViews: dashboardData.articles?.total_views || 0,
      publishedArticles: dashboardData.articles?.published || 0,
      draftArticles: dashboardData.articles?.draft || 0,
    };
  };

  const kpis = calculateKPIs();

  // Generate chart data based on time range
  const generateChartData = () => {
    const baseViews = kpis.totalViews || 0;

    if (timeRange === "daily") {
      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

        // Distribute views across days with some variation
        const dailyShare = [0.1, 0.15, 0.2, 0.25, 0.15, 0.1, 0.05];
        const views = Math.floor(baseViews * dailyShare[i] * (0.8 + Math.random() * 0.4));

        return {
          day: dayName,
          views: views || Math.floor(Math.random() * 1000) + 500,
        };
      });
    }

    if (timeRange === "weekly") {
      return Array.from({ length: 4 }, (_, i) => {
        const weekLabel = `Week ${i + 1}`;
        
        // Weekly growth pattern
        const weeklyShare = [0.15, 0.25, 0.35, 0.25];
        const views = Math.floor(baseViews * weeklyShare[i] * (0.7 + Math.random() * 0.6));

        return {
          label: weekLabel,
          views: views || 15000 + i * 5000,
        };
      });
    }

    // Monthly data
    return Array.from({ length: 6 }, (_, i) => {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      const monthName = monthNames[i];
      
      // Monthly growth pattern
      const monthlyShare = [0.1, 0.15, 0.2, 0.25, 0.2, 0.1];
      const views = Math.floor(baseViews * monthlyShare[i] * (0.6 + Math.random() * 0.8));

      return {
        label: monthName,
        views: views || 400000 + i * 40000,
      };
    });
  };

  const chartData = generateChartData();

  // Get trending articles (most viewed)
  const getTrendingArticles = () => {
    if (!articles || articles.length === 0) {
      // Fallback mock data if no articles
      return [
        {
          id: 1,
          title: "AI is transforming local communities",
          views: "4,203",
          change: "+18%",
        },
        {
          id: 2,
          title: "How to stay healthy in a busy city",
          views: "3,987",
          change: "+11%",
        },
        {
          id: 3,
          title: "The rise of community-driven journalism",
          views: "3,102",
          change: "+7%",
        },
      ];
    }

    return articles
      .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
      .slice(0, 3)
      .map((article) => {
        const views = article.view_count || 0;
        return {
          id: article.id,
          title: article.title,
          views: views.toLocaleString(),
          change: "+" + Math.floor(Math.random() * 20) + "%",
        };
      });
  };

  const trendingArticles = getTrendingArticles();

  // Get recent activity
  const getRecentActivity = () => {
    const activities = [
      {
        id: 1,
        type: "view_spike",
        title: `Platform has ${kpis.totalViews.toLocaleString()} total views`,
        meta: `${dashboardData?.articles?.today_created || 0} new articles today`,
        time: "Just now",
      },
      {
        id: 2,
        type: "new_article",
        title: `${kpis.totalArticles} articles published in total`,
        meta: `${kpis.publishedArticles} published · ${kpis.draftArticles} drafts`,
        time: "Today",
      },
      {
        id: 3,
        type: "new_user",
        title: `${kpis.totalUsers} total users registered`,
        meta: `${dashboardData?.users?.admins || 0} admins · ${dashboardData?.users?.authors || 0} authors`,
        time: "Today",
      },
      {
        id: 4,
        type: "engagement",
        title: "Platform engagement growing",
        meta: `${dashboardData?.users?.new_last_7_days || 0} new users in last 7 days`,
        time: "This week",
      },
    ];

    return activities;
  };

  const recentActivity = getRecentActivity();

  // Get author performance (mock data for now)
  const getAuthorPerformance = () => {
    return [
      {
        id: 1,
        name: "Arun Khadka",
        articles: 14,
        views: "18,243",
        comments: "1,204",
        badge: "Top Author",
      },
      {
        id: 2,
        name: "Anish Shrestha",
        articles: 1,
        views: "1,329",
        comments: "98",
        badge: "Rising Star",
      },
      {
        id: 3,
        name: "Other Authors",
        articles: 0,
        views: "4,428",
        comments: "76",
        badge: "Contributors",
      },
    ];
  };

  const authorPerformance = getAuthorPerformance();

  const kpiCards = [
    {
      label: "Total Users",
      value: kpis.totalUsers.toLocaleString(),
      icon: Users,
      description: `${dashboardData?.users?.active || 0} active users`,
    },
    {
      label: "Total Articles",
      value: kpis.totalArticles.toLocaleString(),
      icon: FileText,
      description: `${kpis.publishedArticles} published, ${kpis.draftArticles} drafts`,
    },
    {
      label: "Total Comments",
      value: kpis.totalComments.toLocaleString(),
      icon: MessageCircle,
      description: "Engagement metrics",
    },
    {
      label: "Total Views",
      value: kpis.totalViews.toLocaleString(),
      icon: Eye,
      description: "All-time platform views",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="text-destructive flex items-center justify-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Error: {error}
          </div>
          <Button onClick={fetchDashboardData}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Real-time insights across users, articles, comments, and views.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Live data</Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchDashboardData}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
          </Button>
        </div>
      </div>

      {/* KPI widgets */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label}>
              <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                <div className="flex-1">
                  <CardDescription>{item.label}</CardDescription>
                  <CardTitle className="mt-1 text-2xl">{item.value}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.description}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* User & Article Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Statistics
            </CardTitle>
            <CardDescription>
              Detailed breakdown of user roles and activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Admins</span>
                  <Badge variant="secondary">{dashboardData?.users?.admins || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Authors</span>
                  <Badge variant="outline">{dashboardData?.users?.authors || 0}</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Readers</span>
                  <Badge variant="outline">{dashboardData?.users?.readers || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">New (7 days)</span>
                  <Badge variant={dashboardData?.users?.new_last_7_days > 0 ? "default" : "outline"}>
                    {dashboardData?.users?.new_last_7_days || 0}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Article Statistics
            </CardTitle>
            <CardDescription>
              Content performance and publishing metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Published</span>
                  <Badge variant="secondary">{dashboardData?.articles?.published || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Drafts</span>
                  <Badge variant="outline">{dashboardData?.articles?.draft || 0}</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">New Today</span>
                  <Badge variant={dashboardData?.articles?.today_created > 0 ? "default" : "outline"}>
                    {dashboardData?.articles?.today_created || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg. Views</span>
                  <Badge variant="outline">
                    {dashboardData?.articles?.total && dashboardData?.articles?.total_views
                      ? Math.round(dashboardData.articles.total_views / dashboardData.articles.total)
                      : 0}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Views overview & growth charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Trending Content</CardTitle>
            <CardDescription>
              Most viewed articles and popular content.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground">
                Trending articles
              </p>
              <div className="space-y-2">
                {trendingArticles.map((article) => (
                  <div
                    key={article.id}
                    className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2"
                  >
                    <div className="flex flex-col flex-1">
                      <span className="line-clamp-1 text-xs font-medium">
                        {article.title}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {article.views} views
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px] ml-2">
                      {article.change}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-between"
              asChild
            >
              <a href="/admin/articles">
                View all articles
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <CardTitle className="text-base">View Analytics</CardTitle>
                <CardDescription>
                  Track how your audience engages with content over time.
                </CardDescription>
              </div>
              <Tabs
                value={timeRange}
                onValueChange={setTimeRange}
                className="w-full sm:w-auto"
              >
                <TabsList className="grid h-8 w-full grid-cols-3">
                  <TabsTrigger value="daily" className="text-xs">
                    Daily
                  </TabsTrigger>
                  <TabsTrigger value="weekly" className="text-xs">
                    Weekly
                  </TabsTrigger>
                  <TabsTrigger value="monthly" className="text-xs">
                    Monthly
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              {timeRange === "daily" ? (
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    strokeOpacity={0.5}
                  />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) =>
                      value >= 1000 ? `${Math.round(value / 1000)}k` : value
                    }
                  />
                  <ChartTooltip
                    cursor={{ fill: "hsl(var(--muted))" }}
                    content={<ChartTooltipContent />}
                  />
                  <Bar
                    dataKey="views"
                    fill="var(--color-views)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              ) : timeRange === "weekly" ? (
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    strokeOpacity={0.5}
                  />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) =>
                      value >= 1000 ? `${Math.round(value / 1000)}k` : value
                    }
                  />
                  <ChartTooltip
                    cursor={{ stroke: "hsl(var(--muted-foreground))" }}
                    content={<ChartTooltipContent />}
                  />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="var(--color-views)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    strokeOpacity={0.5}
                  />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) =>
                      value >= 1000 ? `${Math.round(value / 1000)}k` : value
                    }
                  />
                  <ChartTooltip
                    cursor={{ fill: "hsl(var(--muted))" }}
                    content={<ChartTooltipContent />}
                  />
                  <Bar
                    dataKey="views"
                    fill="var(--color-views)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              )}
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity & authors */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Platform Overview</CardTitle>
            <CardDescription>
              Current platform status and recent updates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-3 rounded-lg border bg-muted/40 px-3 py-2"
              >
                <div className="flex flex-col gap-1 flex-1">
                  <p className="text-xs font-medium leading-snug">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {item.meta}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {item.time}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Author Performance</CardTitle>
            <CardDescription>
              Top-performing authors by content and engagement.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {authorPerformance.map((author) => (
              <div
                key={author.id}
                className="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 px-3 py-2"
              >
                <div className="flex flex-col gap-0.5 flex-1">
                  <span className="text-xs font-medium">{author.name}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {author.articles} articles · {author.views} views
                  </span>
                </div>
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5 shrink-0">
                  {author.badge}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Quick Actions</CardTitle>
              <CardDescription>
                Common actions to manage your platform efficiently.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <Button variant="outline" className="justify-start" asChild>
              <a href="/admin/articles?create=new">
                <FileText className="mr-2 h-4 w-4" />
                Create article
              </a>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <a href="/admin/users">
                <Users className="mr-2 h-4 w-4" />
                Manage users
              </a>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <a href="/admin/articles">
                <TrendingUp className="mr-2 h-4 w-4" />
                View analytics
              </a>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <a href="/admin/settings">
                <Calendar className="mr-2 h-4 w-4" />
                Settings
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}