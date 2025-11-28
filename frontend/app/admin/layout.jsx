"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, FileText, BarChart3, Tag, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const adminNavItems = [
  {
    title: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Articles",
    href: "/admin/articles",
    icon: FileText,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: Tag,
  },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const isAuthRoute = pathname === "/admin/login";

  useEffect(() => {
    if (loading) return;

    if (isAuthRoute) {
      if (user?.is_admin) {
        router.replace("/admin");
      }
      return;
    }

    if (!user) {
      router.replace("/admin/login");
      return;
    }

    if (!user.is_admin) {
      router.replace("/");
    }
  }, [user, loading, isAuthRoute, router]);

  const handleLogout = () => {
    logout();
    router.replace("/admin/login");
  };

  if (isAuthRoute) {
    return <>{children}</>;
  }

  if (loading || !user || !user.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p>Checking admin session...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider className="bg-muted/30">
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">
              B
            </div>
            <div className="flex flex-col min-w-0 flex-1 transition-all duration-200 group-data-[collapsed=true]:opacity-0 group-data-[collapsed=true]:w-0 group-data-[collapsed=true]:overflow-hidden">
              <span className="text-sm font-semibold truncate">BlogHub</span>
              <span className="text-xs text-muted-foreground truncate">
                Admin Console
              </span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="transition-all duration-200 group-data-[collapsed=true]:opacity-0 group-data-[collapsed=true]:w-0 group-data-[collapsed=true]:overflow-hidden">
              Management
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/admin" && pathname.startsWith(item.href));

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span className="transition-all duration-200 group-data-[collapsed=true]:opacity-0 group-data-[collapsed=true]:w-0 group-data-[collapsed=true]:overflow-hidden">
                            {item.title}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="px-2 py-1.5">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 h-9 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="transition-all duration-200 group-data-[collapsed=true]:opacity-0 group-data-[collapsed=true]:w-0 group-data-[collapsed=true]:overflow-hidden">
                Logout
              </span>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <div className="flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <span className="text-sm font-semibold tracking-tight">
              Admin Dashboard
            </span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <Input
                placeholder="Search users, articles..."
                className="h-9 w-52"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              className="hidden sm:inline-flex"
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              View Reports
            </Button>
          
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}