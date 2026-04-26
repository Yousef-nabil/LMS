import React from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import {BookOpen, Users, Check, Circle } from "lucide-react";
import logoIcon from "../assets/icon.png";
import FormInput from "../components/FormInput";
import AlertCard from "../components/AlertCard";
import type { SignupRequest, SignupErrors, Role } from "../types/auth";
import { authService } from "../api";
import { validateSignup } from "../utils/helper";
import { useAppDispatch } from "../store/hooks";
import { setCredentials } from "../store/slices/authSlice";

export function SignupPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<SignupErrors>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateSignup(name, email, password, confirmPassword, role);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setError("");
    setLoading(true);
    try {
      const data: SignupRequest = { name, email, password, role: role as Role };
      await authService.signup(data);
      const { data: user } = await authService.getSelf();
      dispatch(setCredentials({ user }));
      // navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
   
  };


  const roles: { value: Role; label: string; description: string; icon: React.ReactNode }[] = [
    {
      value: "student",
      label: "Student",
      description: "Enroll in courses and learn",
      icon: <BookOpen className="size-6" />,
    },
    {
      value: "instructor",
      label: "Instructor",
      description: "Create and manage courses",
      icon: <Users className="size-6" />,
    },
  ];

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Left Side  */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:block flex-1 relative"
      >
        <div className="absolute inset-0 bg-linear-to-br from-primary/90 to-purple-600/90" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white">
            <h2 className="text-5xl font-bold mb-6">Start Learning Today</h2>
            <p className="text-xl text-white/90">Join thousands of students worldwide</p>
          </div>
        </div>
      </motion.div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl"
        >
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="size-10 rounded-xl bg-primary flex items-center justify-center">
              <img
                src={logoIcon}
                alt="LearnHub Logo"
                className="relative size-6 drop-shadow-sm invert brightness-0 object-contain"
              />
            </div>
            <span className="text-2xl font-bold text-foreground">LearnHub</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Create your account</h1>
            <p className="text-muted-foreground">Start your learning journey with LearnHub</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <AlertCard
                variant="error"
                message={error}
                onClose={() => setError("")}
              />
            )}

            {/* Role Selector */}
            <div className="space-y-1">
              <label className="block mb-2">I want to join as</label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((r) => (
                  <motion.button
                    key={r.value}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setRole(r.value);
                      if (fieldErrors.role) setFieldErrors((prev) => ({ ...prev, role: undefined }));
                    }}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${role === r.value
                        ? "border-primary bg-primary/10 text-primary shadow-md shadow-primary/10"
                        : "border-input bg-input-background text-muted-foreground hover:border-primary/40 hover:bg-primary/5"
                      }`}
                  >
                    {role === r.value && (
                      <motion.div
                        layoutId="role-check"
                        className="absolute top-2 right-2 size-5 rounded-full bg-primary flex items-center justify-center"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </motion.div>
                    )}
                    <div className={`p-2 rounded-lg ${role === r.value ? "bg-primary/20" : "bg-muted"}`}>
                      {r.icon}
                    </div>
                    <span className="font-semibold text-sm">{r.label}</span>
                    <span className="text-xs text-muted-foreground text-center">{r.description}</span>
                  </motion.button>
                ))}
              </div>
              {fieldErrors.role && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.role}</p>
              )}
            </div>

            {/* Name & Email side by side */}
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                id="name"
                name="name"
                label="Full Name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="John Doe"
                error={fieldErrors.name}
              />

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
            </div>

            {/* Password & Confirm side by side */}
            <div className="grid grid-cols-2 gap-4">
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

              <FormInput
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
                placeholder="••••••••"
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                error={fieldErrors.confirmPassword}
              />
            </div>

            {/* Password Requirements */}
            <div className="grid grid-cols-3 gap-x-4 gap-y-1.5 text-xs">
              {[
                { label: "8+ characters", met: password.length >= 8 },
                { label: "1 lowercase (a-z)", met: /[a-z]/.test(password) },
                { label: "1 uppercase (A-Z)", met: /[A-Z]/.test(password) },
                { label: "1 number (0-9)", met: /[0-9]/.test(password) },
                { label: "1 symbol (!@#...)", met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
              ].map((rule) => (
                <div key={rule.label} className="flex items-center gap-1.5">
                  {rule.met ? (
                    <Check className="size-3.5 text-success shrink-0" />
                  ) : (
                    <Circle className="size-3.5 text-muted-foreground/40 shrink-0" />
                  )}
                  <span className={rule.met ? "text-success" : "text-muted-foreground"}>
                    {rule.label}
                  </span>
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google OAuth Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleGoogleLogin}
            type="button"
            className="w-full py-3.5 bg-card border border-border rounded-xl font-semibold text-foreground flex items-center justify-center gap-3 hover:bg-accent transition-all cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 1 12c0 1.94.46 3.77 1.18 5.07l3.66-2.98z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </motion.button>

          <div className="mt-5 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
