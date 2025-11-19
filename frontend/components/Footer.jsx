"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/category/list/`
        );

        if (response.data.success) {
          setCategories(response.data.data || []);
        } else {
          setError("Failed to fetch categories");
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <footer className="bg-muted/30 border-t border-border mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">
                  B
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">BlogHub</h3>
                <p className="text-xs text-muted-foreground">
                  Your Daily Stories
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Bringing you the latest news, stories, and insights from our
              community. Stay informed, stay connected, and discover what
              matters most.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="p-2 bg-background hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2 bg-background hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2 bg-background hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2 bg-background hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="">
            <h4 className="text-sm font-bold text-foreground mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2 ">
              <li>
                <a
                  href="/about"
                  className="text-sm hover:underline hover:underline-offset-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-sm hover:underline hover:underline-offset-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm hover:underline hover:underline-offset-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  Advertise
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm hover:underline hover:underline-offset-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-bold text-foreground mb-4">
              Categories
            </h4>
            {isLoading ? (
              <div className="space-y-2 ">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-4 bg-muted rounded animate-pulse"
                  ></div>
                ))}
              </div>
            ) : error ? (
              <p className="text-sm text-muted-foreground">
                Failed to load categories
              </p>
            ) : categories.length > 0 ? (
              <ul className="space-y-2">
                {categories.slice(0, 6).map((category) => (
                  <li key={category.id}>
                    <a
                      href={`/category/${category.slug}`}
                      className="text-sm text-muted-foreground hover:underline hover:underline-offset-2 hover:text-primary transition-colors"
                    >
                      {category.name}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No categories available
              </p>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 BlogHub. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
