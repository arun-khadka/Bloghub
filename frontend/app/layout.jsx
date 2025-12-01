import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata = {
  title: "BlogHub - Your Daily Stories",
  description:
    "Stay informed with the latest news, stories, and insights from our community",
  generator: "v0.app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
        <Toaster
          position="bottom-right"
          duration={5000}
          theme="system"
          // closeButton
          richColors
          toastOptions={{
            style: {
              background: "hsl(var(--toast-background))",
              color: "hsl(var(--toast-foreground))",
              border: "1px solid hsl(var(--toast-border))",
              borderRadius: "12px",
              boxShadow: "var(--toast-shadow)",
              padding: "16px",
              fontSize: "14px",
            },
            classNames: {
              toast: "toast-custom",
              title: "font-semibold text-base",
              description: "text-sm opacity-90 mt-1",
              actionButton:
                "bg-blue-600 text-white font-medium rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors",
              cancelButton:
                "bg-gray-100 text-gray-700 font-medium rounded-lg px-4 py-2 hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700",
              closeButton:
                "bg-transparent border-none text-gray-500 hover:text-gray-700 transition-colors dark:hover:text-gray-300",
            },
          }}
          expand={false}
          visibleToasts={3}
          offset="16px"
          gap={12}
        />
        <Analytics />
      </body>
    </html>
  );
}
