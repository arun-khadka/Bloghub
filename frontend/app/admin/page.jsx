"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  FileText,
  MessageCircle,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
} from "lucide-react";

// Mock analytics data – replace with real API data when ready
const kpiCards = [
  {
    label: "Total Users",
    value: "12,438",
    delta: "+8.2%",
    trend: "up",
    icon: Users,
  },
  {
    label: "Total Articles",
    value: "324",
    delta: "+3.4%",
    trend: "up",
    icon: FileText,
  },
  {
    label: "Total Comments",
    value: "5,981",
    delta: "+1.1%",
    trend: "up",
    icon: MessageCircle,
  },
  {
    label: "Total Views",
    value: "842,190",
    delta: "-2.3%",
    trend: "down",
    icon: Eye,
  },
];

const viewOverview = {
  total: "842,190",
  today: "12,431",
  trendingArticles: [
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
  ],
};

const dailyViews = [
  { day: "Mon", views: 10234 },
  { day: "Tue", views: 12431 },
  { day: "Wed", views: 11782 },
  { day: "Thu", views: 13902 },
  { day: "Fri", views: 12893 },
  { day: "Sat", views: 9321 },
  { day: "Sun", views: 8427 },
];

const weeklyGrowth = [
  { label: "Week 1", views: 65432 },
  { label: "Week 2", views: 71203 },
  { label: "Week 3", views: 76321 },
  { label: "Week 4", views: 84219 },
];

const monthlyGrowth = [
  { label: "Jan", views: 421903 },
  { label: "Feb", views: 482190 },
  { label: "Mar", views: 512834 },
  { label: "Apr", views: 563002 },
  { label: "May", views: 612391 },
  { label: "Jun", views: 654821 },
];

const recentActivity = [
  {
    id: 1,
    type: "view_spike",
    title: "Article “AI is transforming local communities” is trending",
    meta: "+1,204 views in the last hour",
    time: "10 min ago",
  },
  {
    id: 2,
    type: "new_article",
    title: "New article published by Sarah Lee",
    meta: "“Designing resilient urban spaces”",
    time: "32 min ago",
  },
  {
    id: 3,
    type: "new_user",
    title: "43 new users signed up",
    meta: "Conversion rate 6.2%",
    time: "1 hr ago",
  },
  {
    id: 4,
    type: "comment_spike",
    title: "Comments are surging on “Healthy habits for remote workers”",
    meta: "+287 comments today",
    time: "3 hr ago",
  },
];

const authorPerformance = [
  {
    id: 1,
    name: "Alex Carter",
    articles: 42,
    views: "182,430",
    comments: "1,204",
    badge: "Top Author",
  },
  {
    id: 2,
    name: "Sarah Lee",
    articles: 28,
    views: "132,987",
    comments: "982",
    badge: "Rising Star",
  },
  {
    id: 3,
    name: "Michael Chen",
    articles: 31,
    views: "121,304",
    comments: "843",
    badge: "Most Engaging",
  },
];

const chartConfig = {
  views: {
    label: "Views",
    color: "hsl(var(--chart-1))",
  },
};

export default function AdminDashboardPage() {
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
          <Badge variant="outline">Live data · Mocked</Badge>
          <Button size="sm" variant="outline">
            Export
          </Button>
        </div>
      </div>

      {/* KPI widgets */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((item) => {
          const Icon = item.icon;
          const isUp = item.trend === "up";
          return (
            <Card key={item.label}>
              <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                <div>
                  <CardDescription>{item.label}</CardDescription>
                  <CardTitle className="mt-1 text-2xl">
                    {item.value}
                  </CardTitle>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      isUp
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                        : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                    }`}
                  >
                    {isUp ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {item.delta}
                  </span>
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Views overview & growth charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Views Overview</CardTitle>
            <CardDescription>
              Total views, today&apos;s performance, and trending articles.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Total Views</p>
                <p className="text-xl font-semibold">{viewOverview.total}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Today&apos;s Views</p>
                <p className="text-xl font-semibold">{viewOverview.today}</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground">
                Trending articles
              </p>
              <div className="space-y-2">
                {viewOverview.trendingArticles.map((article) => (
                  <div
                    key={article.id}
                    className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2"
                  >
                    <div className="flex flex-col">
                      <span className="line-clamp-1 text-xs font-medium">
                        {article.title}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {article.views} views
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-300">
                      <ArrowUpRight className="h-3 w-3" />
                      {article.change}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-between"
            >
              View detailed analytics
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <CardTitle className="text-base">View Growth</CardTitle>
                <CardDescription>
                  Track how your audience grows over time.
                </CardDescription>
              </div>
              <Tabs defaultValue="daily" className="w-full sm:w-auto">
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
            <Tabs defaultValue="daily">
              <TabsContent value="daily" className="mt-0">
                <ChartContainer config={chartConfig}>
                  <BarChart data={dailyViews}>
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
                </ChartContainer>
              </TabsContent>
              <TabsContent value="weekly" className="mt-0">
                <ChartContainer config={chartConfig}>
                  <LineChart data={weeklyGrowth}>
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
                </ChartContainer>
              </TabsContent>
              <TabsContent value="monthly" className="mt-0">
                <ChartContainer config={chartConfig}>
                  <BarChart data={monthlyGrowth}>
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
                </ChartContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity & authors */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <CardDescription>
              Real-time feed of spikes, new content, and audience engagement.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-3 rounded-lg border bg-muted/40 px-3 py-2"
              >
                <div className="flex flex-col gap-1">
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
              Top-performing authors by views and engagement.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {authorPerformance.map((author) => (
              <div
                key={author.id}
                className="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 px-3 py-2"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium">{author.name}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {author.articles} articles · {author.views} views ·{" "}
                    {author.comments} comments
                  </span>
                </div>
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
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
                Common actions to keep your content and community healthy.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <Button variant="outline" className="justify-start" asChild>
              <a href="/create-article">
                <FileText className="mr-2 h-4 w-4" />
                Create new article
              </a>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <a href="/admin/users">
                <Users className="mr-2 h-4 w-4" />
                Review new users
              </a>
            </Button>
            <Button variant="outline" className="justify-start">
              <MessageCircle className="mr-2 h-4 w-4" />
              Moderate comments
            </Button>
            <Button variant="outline" className="justify-start">
              <Eye className="mr-2 h-4 w-4" />
              Check view anomalies
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


