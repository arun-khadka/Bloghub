"use client";

import { useState } from "react";
import { Search, Menu, X, Bookmark, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import LiveSearch from "./LiveSearch";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Header() {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();

  // Helper function to determine link classes
  const getLinkClasses = (href) => {
    const baseClasses = "text-sm font-medium transition-colors";

    if (pathname === href) {
      return `${baseClasses} text-primary`; // Active state
    } else {
      return `${baseClasses} text-muted-foreground hover:text-primary`; // Inactive state
    }
  };

  // Helper function for mobile links
  const getMobileLinkClasses = (href) => {
    const baseClasses =
      "px-4 py-2 text-sm font-medium hover:bg-accent rounded-lg transition-colors";

    if (pathname === href) {
      return `${baseClasses} text-primary bg-accent/50`; // Active state
    } else {
      return `${baseClasses} text-muted-foreground`; // Inactive state
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="container mx-auto px-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-primary-foreground font-bold text-xl">
                  B
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  BlogHub
                </h1>
                <p className="text-xs text-muted-foreground">
                  Your Daily Stories
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className={getLinkClasses("/")}>
                Home
              </Link>
              <Link href="/about" className={getLinkClasses("/about")}>
                About
              </Link>
              <Link href="/contact" className={getLinkClasses("/contact")}>
                Contact
              </Link>
            </nav>

            {/* Actions */}

            <div className="flex items-center gap-3">
              {user && (
                <Link
                  href="/bookmarks"
                  className="p-2 hover:bg-accent rounded-lg transition-all duration-300 hover:scale-110"
                  aria-label="Saved Articles"
                >
                  <Bookmark className="w-5 h-5 text-foreground" />
                </Link>
              )}

              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 hover:bg-accent rounded-lg transition-all duration-300 hover:scale-110"
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-foreground" />
              </button>

              {user ? (
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-2 hover:bg-accent rounded-lg transition-all duration-300"
                >
                  <img
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="hidden lg:block text-sm font-medium text-foreground">
                    {user.name}
                  </span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-300 hover:scale-105"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="text-sm font-medium">Sign In</span>
                </Link>
              )}

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 hover:bg-accent rounded-lg transition-all duration-300"
                aria-label="Menu"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5 text-foreground" />
                ) : (
                  <Menu className="w-5 h-5 text-foreground" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <nav className="md:hidden pb-4 animate-in slide-in-from-top duration-300">
              <div className="flex flex-col gap-2">
                <Link
                  href="/"
                  className={getMobileLinkClasses("/")}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  className={getMobileLinkClasses("/about")}
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className={getMobileLinkClasses("/contact")}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
                {user ? (
                  <Link
                    href="/profile"
                    className={getMobileLinkClasses("/profile")}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className={getMobileLinkClasses("/login")}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Live Search Modal */}
      <LiveSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
