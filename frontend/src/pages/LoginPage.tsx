import React from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { GraduationCap } from "lucide-react";
import FormInput from "../components/FormInput";
import AlertCard from "../components/AlertCard";
import type { LoginRequest, LoginErrors } from "../types/auth";
import { authService } from "../api";
import { validateLogin } from "../utils/helper";
import { useAppDispatch } from "../store/hooks";
import { setCredentials } from "../store/slices/authSlice";

export function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateLogin(email, password);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setError("");
    setLoading(true);
    try {
      const credentials: LoginRequest = { email, password };
      const response = await authService.login(credentials);
      const user = response.user;
      // dispatch(setCredentials({ user }));
      // navigate(user.role === 'instructor' ? "/instructor/dashboard" : "/student/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="size-10 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="size-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">LearnHub</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to continue your learning journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <AlertCard
                variant="error"
                message={error}
                onClose={() => setError("")}
              />
            )}

            <FormInput
              id="email"
              name="email"
              label="Email"
              type="text"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder="john@example.com"
              error={fieldErrors.email}
            />

            <FormInput
              id="password"
              name="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }}
              placeholder="••••••••"
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              error={fieldErrors.password}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="size-4 rounded border-input" />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <a href="#" className="text-sm text-primary font-medium hover:underline">
                Forgot password?
              </a>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer" 
            >
              {loading ? "Signing In..." : "Sign In"}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Image */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:block flex-1 relative"
      >
        <div className="absolute inset-0 bg-linear-to-br from-primary/90 to-purple-600/90" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white">
            <h2 className="text-5xl font-bold mb-6">Continue Your Journey</h2>
            <p className="text-xl text-white/90">Access your courses and track your progress</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
