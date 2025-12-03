"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Chart configuration
const chartConfig = {
  views: {
    label: "Views",
    color: "hsl(var(--chart-1))",
  },
  articles: {
    label: "Articles",
    color: "hsl(var(--chart-2))",
  },
};

export default function ViewAnalyticsChart() {
  const [viewsData, setViewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("monthly");
  const [chartData, setChartData] = useState([]);

  // Fetch views analytics data
  const fetchViewsData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("accessToken");
      
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `http://127.0.0.1:8000/api/blog/analytics/views/?time_range=${timeRange}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`${timeRange.toUpperCase()} Analytics Response:`, data);
      
      setViewsData(data);
      
      // Process chart data based on time range
      if (data.chart_data && data.chart_data.length > 0) {
        const processedData = processChartData(data.chart_data, timeRange);
        setChartData(processedData);
      } else {
        // Generate fallback chart data if no chart_data
        setChartData(generateFallbackChartData(data, timeRange));
      }

    } catch (err) {
      console.error("Error fetching views data:", err);
      setError(err.message || "Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  // Process chart data from API response
  const processChartData = (apiData, range) => {
    if (range === "daily") {
      // If API returns daily data with 'date' or 'day' field
      return apiData.map(item => ({
        date: item.date,
        day: item.day || formatDate(item.date) || item.label,
        label: item.day || formatDate(item.date) || item.label,
        views: item.views || 0,
        articles: item.articles || 0,
      }));
    } else if (range === "weekly") {
      // For weekly data
      return apiData.map(item => ({
        week: item.week_number,
        label: item.label || `Week ${item.week_number}`,
        start_date: item.start_date,
        end_date: item.end_date,
        views: item.views || 0,
        articles: item.articles || 0,
      }));
    } else {
      // For monthly data
      return apiData.map(item => ({
        month: item.month,
        label: item.label || item.month_name || formatMonth(item.month),
        views: item.views || 0,
        articles: item.articles || 0,
      }));
    }
  };

  // Generate fallback chart data if API doesn't provide structured data
  const generateFallbackChartData = (data, range) => {
    const periodViews = data.time_range_kpis?.total_views_in_period || data.total_views || 0;
    const periodArticles = data.time_range_kpis?.articles_published_in_period || 0;
    
    if (range === "daily") {
      // Generate last 7 days
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
        const dateStr = date.toISOString().split("T")[0];
        
        // Distribute views across days (more recent = more views)
        const dayWeight = i === 6 ? 0.25 : i === 5 ? 0.2 : i === 4 ? 0.18 : 
                         i === 3 ? 0.15 : i === 2 ? 0.12 : i === 1 ? 0.07 : 0.03;
        const dailyViews = Math.floor(periodViews * dayWeight);
        
        days.push({
          date: dateStr,
          day: dayName,
          label: dayName,
          views: dailyViews,
          articles: Math.floor(periodArticles / 7),
        });
      }
      return days;
    } else if (range === "weekly") {
      // Generate last 4 weeks
      const weeks = [];
      for (let i = 3; i >= 0; i--) {
        const weekWeight = i === 3 ? 0.35 : i === 2 ? 0.3 : i === 1 ? 0.2 : 0.15;
        const weeklyViews = Math.floor(periodViews * weekWeight);
        
        weeks.push({
          week: 4 - i,
          label: `Week ${4 - i}`,
          views: weeklyViews,
          articles: Math.floor(periodArticles / 4),
        });
      }
      return weeks;
    } else {
      // Generate last 6 months
      const months = [];
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthName = monthNames[date.getMonth()];
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        // Distribute views (more recent = more views)
        const monthWeight = i === 5 ? 0.15 : i === 4 ? 0.17 : i === 3 ? 0.18 : 
                          i === 2 ? 0.2 : i === 1 ? 0.15 : 0.15;
        const monthlyViews = Math.floor(periodViews * monthWeight);
        
        months.push({
          month: monthYear,
          label: monthName,
          views: monthlyViews,
          articles: Math.floor(periodArticles / 6),
        });
      }
      return months;
    }
  };

  // Helper functions for formatting
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatMonth = (monthString) => {
    if (!monthString) return "";
    const [year, month] = monthString.split("-");
    const date = new Date(year, month - 1);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  useEffect(() => {
    fetchViewsData();
  }, [timeRange]); // Re-fetch when timeRange changes

  // Calculate KPIs
  const kpis = {
    totalViews: viewsData?.total_views || 0,
    averageViews: viewsData?.average_views || 0,
    periodTotalViews: viewsData?.time_range_kpis?.total_views_in_period || 0,
    periodAvgViews: viewsData?.time_range_kpis?.avg_views_in_period || 0,
    articlesPublished: viewsData?.time_range_kpis?.articles_published_in_period || 0,
  };

  // Calculate growth from chart data
  const calculateGrowth = () => {
    if (!chartData || chartData.length < 2) return 0;
    
    const current = chartData[chartData.length - 1]?.views || 0;
    const previous = chartData[chartData.length - 2]?.views || 0;
    
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const growthPercentage = calculateGrowth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center space-y-4">
          <div className="text-destructive flex items-center justify-center gap-2">
            Error: {error}
          </div>
          <Button onClick={fetchViewsData}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
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
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Total Views</span>
                <p className="text-2xl font-bold">{kpis.totalViews.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Avg per Article</span>
                <p className="text-2xl font-bold">{kpis.averageViews.toFixed(1)}</p>
              </div>
            </div>
            <ChartContainer config={chartConfig}className="h-[300px]">
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
  );
}