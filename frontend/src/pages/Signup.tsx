import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { useState } from 'react';
import { BookOpen, Users, Check, Circle } from 'lucide-react';
import logoIcon from '../assets/icon.png';
import FormInput from '../components/FormInput';
import AlertCard from '../components/AlertCard';
import type { SignupRequest, SignupErrors, Role } from '../types/auth';
import { authService } from '../api';
import { validateSignup } from '../utils/helper';
import { useAuth } from '../hooks/useAuth';

export function SignupPage() {
  const { authenticate } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role | ''>('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<SignupErrors>({});
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateSignup(name, email, password, confirmPassword, role);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setError('');

    setLoading(true);
    try {
      const data: SignupRequest = { name, email, password, role: role as Role };
      console.log(data);
      const res = await authenticate(() => authService.signup(data));
      //  console.log(res)
    } catch (err: any) {
      //  console.log(err)
      setError(
        err.response?.data?.message || 'Signup failed. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const roles: {
    value: Role;
    label: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      value: 'student',
      label: 'Student',
      description: 'Enroll in courses and learn',
      icon: <BookOpen className="size-6" />,
    },
    {
      value: 'instructor',
      label: 'Instructor',
      description: 'Create and manage courses',
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
            <p className="text-xl text-white/90">
              Join thousands of students worldwide
            </p>
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
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Create your account
            </h1>
            <p className="text-muted-foreground">
              Start your learning journey with LearnHub
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <AlertCard
                variant="error"
                message={error}
                onClose={() => setError('')}
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
                      if (fieldErrors.role)
                        setFieldErrors((prev) => ({
                          ...prev,
                          role: undefined,
                        }));
                    }}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      role === r.value
                        ? 'border-primary bg-primary/10 text-primary shadow-md shadow-primary/10'
                        : 'border-input bg-input-background text-muted-foreground hover:border-primary/40 hover:bg-primary/5'
                    }`}
                  >
                    {role === r.value && (
                      <motion.div
                        layoutId="role-check"
                        className="absolute top-2 right-2 size-5 rounded-full bg-primary flex items-center justify-center"
                        initial={false}
                        transition={{
                          type: 'spring',
                          stiffness: 500,
                          damping: 30,
                        }}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M20 6L9 17l-5-5"
                            stroke="white"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </motion.div>
                    )}
                    <div
                      className={`p-2 rounded-lg ${role === r.value ? 'bg-primary/20' : 'bg-muted'}`}
                    >
                      {r.icon}
                    </div>
                    <span className="font-semibold text-sm">{r.label}</span>
                    <span className="text-xs text-muted-foreground text-center">
                      {r.description}
                    </span>
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
                  if (fieldErrors.name)
                    setFieldErrors((prev) => ({ ...prev, name: undefined }));
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
                  if (fieldErrors.email)
                    setFieldErrors((prev) => ({ ...prev, email: undefined }));
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
                  if (fieldErrors.password)
                    setFieldErrors((prev) => ({
                      ...prev,
                      password: undefined,
                    }));
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
                  if (fieldErrors.confirmPassword)
                    setFieldErrors((prev) => ({
                      ...prev,
                      confirmPassword: undefined,
                    }));
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
                { label: '8+ characters', met: password.length >= 8 },
                { label: '1 lowercase (a-z)', met: /[a-z]/.test(password) },
                { label: '1 uppercase (A-Z)', met: /[A-Z]/.test(password) },
                { label: '1 number (0-9)', met: /[0-9]/.test(password) },
                {
                  label: '1 symbol (!@#...)',
                  met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
                },
              ].map((rule) => (
                <div key={rule.label} className="flex items-center gap-1.5">
                  {rule.met ? (
                    <Check className="size-3.5 text-success shrink-0" />
                  ) : (
                    <Circle className="size-3.5 text-muted-foreground/40 shrink-0" />
                  )}
                  <span
                    className={
                      rule.met ? 'text-success' : 'text-muted-foreground'
                    }
                  >
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
              {loading ? 'Creating Account...' : 'Create Account'}
            </motion.button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary font-medium hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
