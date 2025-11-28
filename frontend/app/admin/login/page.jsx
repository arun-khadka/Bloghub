"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { toast } from "sonner";
import { Shield, Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

const adminLoginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email").trim(),
  password: z
    .string()
    .min(1, "Password is required")
    .min(5, "Password must be at least 5 characters")
    .max(100, "Password is too long"),
});

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, adminLogin } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (user?.is_admin) {
      router.replace("/admin");
    }
  }, [user, router]);

  const validateField = (name, value) => {
    try {
      const fieldSchema = adminLoginSchema.pick({ [name]: true });
      fieldSchema.parse({ [name]: value });
      return "";
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0]?.message || "Invalid value";
      }
      return "Validation error";
    }
  };

  const validateForm = () => {
    try {
      adminLoginSchema.parse(formData);
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = {};
        error.errors.forEach((err) => {
          const key = err.path[0];
          if (key) {
            errors[key] = err.message;
          }
        });
        setFormErrors(errors);
      }
      return false;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validateField(name, value);
      setFormErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setFormErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");

    setTouched({ email: true, password: true });
    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    setSubmitting(true);
    try {
      await adminLogin(formData.email, formData.password);
      toast.success("Welcome back, admin!");
      router.replace("/admin");
    } catch (error) {
      const message =
        error?.message ||
        "Unable to sign in. Please verify your admin credentials.";
      setAuthError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const fieldState = (field) => {
    if (!touched[field]) return "default";
    return formErrors[field] ? "error" : "success";
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/10 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Shield className="h-4 w-4" />
            Admin Console Access
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Sign in as Admin</h1>
            <p className="text-muted-foreground">
              Only verified administrators can access the BlogHub control room.
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {authError && (
              <Alert variant="destructive" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@bloghub.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={fieldState("email") === "error"}
                  aria-describedby={formErrors.email ? "email-error" : undefined}
                  className={`pl-10 ${
                    fieldState("email") === "error"
                      ? "border-destructive focus-visible:ring-destructive/30"
                      : fieldState("email") === "success"
                      ? "border-green-500 focus-visible:ring-green-500/30"
                      : ""
                  }`}
                />
                {fieldState("email") === "success" && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
              </div>
              {formErrors.email && touched.email && (
                <p
                  id="email-error"
                  className="text-sm text-destructive flex items-center gap-1"
                >
                  <AlertCircle className="h-4 w-4" />
                  {formErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={fieldState("password") === "error"}
                  aria-describedby={
                    formErrors.password ? "password-error" : undefined
                  }
                  className={`pl-10 pr-12 ${
                    fieldState("password") === "error"
                      ? "border-destructive focus-visible:ring-destructive/30"
                      : fieldState("password") === "success"
                      ? "border-green-500 focus-visible:ring-green-500/30"
                      : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formErrors.password && touched.password && (
                <p
                  id="password-error"
                  className="text-sm text-destructive flex items-center gap-1"
                >
                  <AlertCircle className="h-4 w-4" />
                  {formErrors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 text-base font-semibold"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                  Verifying admin access...
                </span>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Need help? Contact a super admin to get access.
          </p>
        </div>
      </div>
    </div>
  );
}


