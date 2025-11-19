"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { z } from "zod";

// Zod validation schema
const signupSchema = z
  .object({
    fullname: z
      .string()
      .min(1, "Full name is required")
      .min(2, "Full name must be at least 2 characters long")
      .max(100, "Full name is too long")
      .regex(/^[a-zA-Z\s]+$/, "Full name can only contain letters and spaces")
      .trim(),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address")
      .trim(),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters long")
      .max(100, "Password is too long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

// Toast component
const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-300">
      <div
        className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg border ${
          type === "success"
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-red-50 border-red-200 text-red-800"
        }`}
      >
        {type === "success" ? (
          <CheckCircle className="w-5 h-5" />
        ) : (
          <AlertCircle className="w-5 h-5" />
        )}
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 hover:opacity-70 transition-opacity"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [formErrors, setFormErrors] = useState({
    fullname: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [touched, setTouched] = useState({
    fullname: false,
    email: false,
    password: false,
    confirm_password: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Validate individual field
  const validateField = (name, value) => {
    try {
      // For confirm_password, we need to validate against the current password value
      if (name === "confirm_password") {
        const confirmSchema = z
          .object({
            password: z.string(),
            confirm_password: z.string().min(1, "Please confirm your password"),
          })
          .refine((data) => data.password === data.confirm_password, {
            message: "Passwords do not match",
            path: ["confirm_password"],
          });

        confirmSchema.parse({
          password: formData.password,
          confirm_password: value,
        });
      } else {
        // Create a partial schema for the specific field
        const fieldSchema = signupSchema.pick({ [name]: true });
        fieldSchema.parse({ [name]: value });
      }
      return "";
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0]?.message || "Invalid value";
      }
      return "Validation error";
    }
  };

  // Validate all fields
  const validateForm = (data = formData) => {
    try {
      signupSchema.parse(data);
      setFormErrors({
        fullname: "",
        email: "",
        password: "",
        confirm_password: "",
      });
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = {
          fullname: "",
          email: "",
          password: "",
          confirm_password: "",
        };

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
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    const newFormData = {
      ...formData,
      [name]: value,
    };

    setFormData(newFormData);

    // If field has been touched, validate it
    if (touched[name]) {
      const error = validateField(name, value);
      setFormErrors((prev) => ({ ...prev, [name]: error }));
    }

    // Special case: when password changes, re-validate confirm_password if it's been touched
    if (name === "password" && touched.confirm_password) {
      const confirmError = validateField(
        "confirm_password",
        newFormData.confirm_password
      );
      setFormErrors((prev) => ({ ...prev, confirm_password: confirmError }));
    }
  };

  // Real-time validation effect
  useEffect(() => {
    if (Object.values(touched).some((field) => field)) {
      const timer = setTimeout(() => {
        validateForm();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [formData, touched]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Mark all fields as touched
    const allTouched = {
      fullname: true,
      email: true,
      password: true,
      confirm_password: true,
    };
    setTouched(allTouched);

    // Validate entire form with current data
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
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register/`,
        {
          fullname: formData.fullname.trim(),
          email: formData.email.trim(),
          password: formData.password,
          confirm_password: formData.confirm_password,
        }
      );

      console.log("Registration response:", response.data);

      if (response.data.success) {
        // Show success toast
        setToast({
          show: true,
          message: "Account created successfully! Redirecting to login...",
          type: "success",
        });

        // Redirect to login page after 2 seconds
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(response.data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);

      // Handle different error formats from API
      if (err.response?.data) {
        const errorData = err.response.data;

        if (errorData.errors) {
          // Handle field-specific errors
          const errorMessages = Object.values(errorData.errors)
            .flat()
            .join(", ");
          setError(errorMessages);
        } else if (errorData.message) {
          setError(errorData.message);
        } else if (errorData.detail) {
          setError(errorData.detail);
        } else if (typeof errorData === "string") {
          setError(errorData);
        } else {
          setError("Registration failed. Please try again.");
        }
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Check if form is valid for real-time validation display
  const isFormValid = () => {
    try {
      signupSchema.parse(formData);
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
        {/* Header */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-primary-foreground font-bold text-2xl">
                B
              </span>
            </div>
          </a>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Create Account
          </h1>
          <p className="text-muted-foreground">
            Join BlogHub and start reading
          </p>
        </div>

        {/* Signup Form */}
        <div className="bg-card border border-border rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label
                htmlFor="fullname"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="fullname"
                  name="fullname"
                  type="text"
                  required
                  value={formData.fullname}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-10 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    getFieldState("fullname") === "error"
                      ? "border-destructive focus:ring-destructive/50"
                      : getFieldState("fullname") === "success"
                      ? "border-green-500 focus:ring-green-500/50"
                      : "border-border focus:ring-primary/50"
                  }`}
                  placeholder="John Doe"
                  aria-describedby={
                    formErrors.fullname ? "fullname-error" : undefined
                  }
                  aria-invalid={getFieldState("fullname") === "error"}
                />
                {getFieldState("fullname") === "success" && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
                {getFieldState("fullname") === "error" && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-destructive" />
                )}
              </div>
              {formErrors.fullname && touched.fullname && (
                <p
                  id="fullname-error"
                  className="mt-2 text-sm text-destructive flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {formErrors.fullname}
                </p>
              )}
            </div>

            {/* Email */}
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
                  onChange={handleInputChange}
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

            {/* Password */}
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
                  onChange={handleInputChange}
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

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirm_password"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-10 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    getFieldState("confirm_password") === "error"
                      ? "border-destructive focus:ring-destructive/50"
                      : getFieldState("confirm_password") === "success"
                      ? "border-green-500 focus:ring-green-500/50"
                      : "border-border focus:ring-primary/50"
                  }`}
                  placeholder="••••••••"
                  aria-describedby={
                    formErrors.confirm_password
                      ? "confirm-password-error"
                      : undefined
                  }
                  aria-invalid={getFieldState("confirm_password") === "error"}
                />
                {getFieldState("confirm_password") === "success" && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
                {getFieldState("confirm_password") === "error" && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-destructive" />
                )}
              </div>
              {formErrors.confirm_password && touched.confirm_password && (
                <p
                  id="confirm-password-error"
                  className="mt-2 text-sm text-destructive flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {formErrors.confirm_password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || (isAnyFieldTouched && !isFormValid())}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-primary font-medium hover:underline"
              >
                Sign in
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

        {/* Toast Notification */}
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ ...toast, show: false })}
          />
        )}
      </div>
    </div>
  );
}
