import { Outlet, Link, useLocation } from 'react-router';
import {
  BookOpen,
  Home,
  TrendingUp,
  PlusCircle,
  BarChart3,
  LogOut,
  UserCircle2,
} from 'lucide-react';
import { motion } from 'motion/react';
import logoIcon from '../assets/icon.png';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAppSelector } from '../store/hooks';
import { useAuth } from '../hooks/useAuth';

export function Layout() {
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);
  const { logout } = useAuth();
  const isInstructor = user?.role === 'instructor';

  const studentNav = [
    { path: '/student/dashboard', label: 'My Courses', icon: Home },
    { path: '/student/browse', label: 'Browse Courses', icon: BookOpen },
    { path: '/student/grades', label: 'Grades', icon: TrendingUp },
  ];

  const instructorNav = [
    { path: "/instructor/my-courses", label: "My Courses", icon: Home },
    { path: "/instructor/create", label: "Create Course", icon: PlusCircle },
    { path: "/instructor/analytics", label: "Analytics", icon: BarChart3 },
    { path: '/instructor/dashboard', label: 'My Courses', icon: Home },
        
  ];

  const navItems = [
    ...(isInstructor ? instructorNav : studentNav),
    { path: '/profile', label: 'Profile', icon: UserCircle2 },
  ];

  const profilePictureUrl = user?.profilePictureUrl || '';

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col fixed h-full"
      >
        <div className="p-6 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-10 rounded-xl bg-primary flex items-center justify-center">
              <img
                src={logoIcon}
                alt="LearnHub Logo"
                className="relative size-6 drop-shadow-sm group-hover:scale-110 group-hover:-rotate-12 transition-all duration-300 invert brightness-0 object-contain"
              />
            </div>
            <div>
              <div className="font-semibold text-lg text-sidebar-foreground">
                LearnHub
              </div>
              <div className="text-xs text-muted-foreground">
                {isInstructor ? 'Instructor' : 'Student'}
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  }`}
                >
                  <Icon className="size-5" />
                  <span className="font-medium">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-sidebar-accent transition-colors">
            <Link
              to="/profile"
              className="flex items-center gap-3 flex-1 min-w-0"
            >
              <div className="size-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {profilePictureUrl ? (
                  <img
                    src={profilePictureUrl}
                    alt={user?.name || 'User profile'}
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="font-semibold text-primary leading-none">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-sidebar-foreground truncate">
                  {user?.name || 'User'}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {user?.email || 'user@example.com'}
                </div>
              </div>
            </Link>
            <button
              onClick={logout}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10 cursor-pointer"
              title="Logout"
            >
              <LogOut className="size-5" />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-card border-b border-border sticky top-0 z-10"
        >
          <div className="px-8 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-foreground">
              {navItems.find((item) => item.path === location.pathname)
                ?.label || 'Dashboard'}
            </h1>
            <ThemeToggle />
          </div>
        </motion.header>

        {/* Page Content */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
