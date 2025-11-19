"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { z } from "zod";

// Zod validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .trim(),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters long")
    .max(100, "Password is too long"),
});

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [formErrors, setFormErrors] = useState({
    email: "",
    password: "",
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Validate individual field
  const validateField = (name, value) => {
    try {
      // Create a partial schema for the specific field
      const fieldSchema = loginSchema.pick({ [name]: true });
      fieldSchema.parse({ [name]: value });
      return "";
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0]?.message || "Invalid value";
      }
      return "Validation error";
    }
  };

  // Validate all fields
  const validateForm = () => {
    try {
      loginSchema.parse(formData);
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0]] = err.message;
          }
        });
        setFormErrors(errors);
      }
      return false;
    }
  };

  // Validate field on blur
  const handleBlur = (e) => {
    const { name, value } = e.target;

    setTouched((prev) => ({ ...prev, [name]: true }));

    const error = validateField(name, value);
    setFormErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Handle input change with validation
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Only validate if the field has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setFormErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Mark all fields as touched
    setTouched({
      email: true,
      password: true,
    });

    // Validate entire form with Zod
    const isValid = validateForm();

    if (!isValid) {
      // Focus on first error field
      const firstErrorField = Object.keys(formErrors).find(
        (key) => formErrors[key]
      );
      if (firstErrorField) {
        document.getElementById(firstErrorField)?.focus();
      }
      return;
    }

    setLoading(true);

    try {
      await login(formData.email, formData.password);

      // Show success toast
      toast.success("Login successful! Welcome back.", {
        position: "top-center",
      });
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err) {
      const errorMessage =
        err?.message ||
        "Invalid credentials. Please check your email and password.";

      setError(errorMessage);

      // Show error toast
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Check if form is valid for real-time validation display
  const isFormValid = () => {
    try {
      loginSchema.parse(formData);
      return true;
    } catch {
      return false;
    }
  };

  // Get field validation state
  const getFieldState = (fieldName) => {
    if (!touched[fieldName]) return "default";
    return formErrors[fieldName] ? "error" : "success";
  };

  // Check if any field has been touched
  const isAnyFieldTouched = Object.values(touched).some((t) => t);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-accent/20 px-4 py-12">
      <div className="w-full max-w-md">
        {/* -------- Header -------- */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-primary-foreground font-bold text-2xl">
                B
              </span>
            </div>
          </a>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">
            Sign in to continue to BlogHub
          </p>
        </div>

        {/* -------- Login Form -------- */}
        <div className="bg-card border border-border rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {error && (
              <div className="bg-destructive/10 justify-center border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-10 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    getFieldState("email") === "error"
                      ? "border-destructive focus:ring-destructive/50"
                      : getFieldState("email") === "success"
                      ? "border-green-500 focus:ring-green-500/50"
                      : "border-border focus:ring-primary/50"
                  }`}
                  placeholder="you@example.com"
                  aria-describedby={
                    formErrors.email ? "email-error" : undefined
                  }
                  aria-invalid={getFieldState("email") === "error"}
                />
                {getFieldState("email") === "success" && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
                {getFieldState("email") === "error" && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-destructive" />
                )}
              </div>
              {formErrors.email && touched.email && (
                <p
                  id="email-error"
                  className="mt-2 text-sm text-destructive flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {formErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-12 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    getFieldState("password") === "error"
                      ? "border-destructive focus:ring-destructive/50"
                      : getFieldState("password") === "success"
                      ? "border-green-500 focus:ring-green-500/50"
                      : "border-border focus:ring-primary/50"
                  }`}
                  placeholder="••••••••"
                  aria-describedby={
                    formErrors.password ? "password-error" : undefined
                  }
                  aria-invalid={getFieldState("password") === "error"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {formErrors.password && touched.password && (
                <p
                  id="password-error"
                  className="mt-2 text-sm text-destructive flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {formErrors.password}
                </p>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading || (isAnyFieldTouched && !isFormValid())}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <a
                href="/signup"
                className="text-primary font-medium hover:underline"
              >
                Sign up
              </a>
            </p>

            <p className="text-sm text-muted-foreground mt-2">
              <a
                href="/forgot-password"
                className="text-primary hover:underline"
              >
                Forgot password?
              </a>
            </p>
          </div>
        </div>

        {/* Validation Summary for Screen Readers */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {isAnyFieldTouched && (
            <div>
              Form validation:{" "}
              {isFormValid()
                ? "All fields are valid"
                : "There are validation errors"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
