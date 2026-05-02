import { motion } from "motion/react";
import { Link } from "react-router";
import { Play, Users, BookOpen, Award } from "lucide-react";
import landingImg from "../assets/landing.jpg";
import logoIcon from "../assets/icon.png";
import { mockCourses } from "../data/mockData";
import { ThemeToggle } from "../components/ThemeToggle";

export function LandingPage() {
  const featuredCourses = mockCourses.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 w-full bg-card/80 backdrop-blur-lg border-b border-border z-50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3 cursor-pointer group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative size-10 rounded-xl bg-linear-to-br from-primary to-purple-600 shadow-lg shadow-primary/30 flex items-center justify-center overflow-hidden border border-white/20 dark:border-white/10">
              <div className="absolute inset-0 bg-linear-to-tr from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
              <img 
                src={logoIcon}
                alt="LearnHub Logo"
                className="relative size-6 drop-shadow-sm group-hover:scale-110 group-hover:-rotate-12 transition-all duration-300 invert brightness-0 object-contain" 
              />
            </div>
            <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/80 tracking-tight">
              LearnHub
            </span>
          </motion.div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="cursor-pointer px-6 py-2 text-foreground font-medium hover:text-primary transition-colors"
              >
                Log In
              </motion.button>
            </Link>
            <Link to="/signup">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="cursor-pointer px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                Sign Up
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6"
            >
              Learn at your own pace
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-6xl font-bold text-foreground leading-tight mb-6"
            >
              Master new skills with expert-led courses
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-muted-foreground mb-8 leading-relaxed"
            >
              Access thousands of courses, automated quizzes, and secure payments. Start learning today.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex gap-4"
            >
              <Link to="/signup">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="cursor-pointer px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                >
                  Browse Courses
                </motion.button>
              </Link>
              <Link to="/signup">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="cursor-pointer px-8 py-4 bg-secondary text-secondary-foreground rounded-xl font-semibold hover:bg-secondary/80 transition-all"
                >
                  Start Teaching
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-purple-500/20 rounded-3xl blur-3xl" />
            <img
              src={landingImg}
              alt="Students learning together"
              className="relative rounded-3xl shadow-2xl w-full h-[500px] object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">Why Choose LearnHub</h2>
            <p className="text-lg text-muted-foreground">Everything you need to succeed</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Play,
                title: "Learn at Your Pace",
                description: "Stream high-quality video content anytime, anywhere on any device",
              },
              {
                icon: BookOpen,
                title: "Automated Quizzes",
                description: "Test your knowledge with instant feedback and track your progress",
              },
              {
                icon: Award,
                title: "Secure Payments",
                description: "Safe and easy checkout with industry-standard encryption",
              },
            ].map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-card p-8 rounded-2xl border border-border shadow-sm hover:shadow-lg transition-all"
              >
                <div className="size-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <benefit.icon className="size-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">Featured Courses</h2>
            <p className="text-lg text-muted-foreground">Start learning with our most popular courses</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredCourses.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 px-3 py-1 bg-card/90 backdrop-blur-sm rounded-lg text-sm font-semibold text-foreground">
                    ${course.price}
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-xs font-medium text-primary mb-2">{course.category}</div>
                  <h3 className="text-xl font-semibold text-foreground mb-3 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="size-4" />
                      <span>{course.students.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link to="/signup">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="cursor-pointer px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                View All Courses
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-linear-to-br from-primary to-purple-600">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-5xl font-bold text-white mb-6">Start Learning Today</h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of students already learning on LearnHub
          </p>
          <Link to="/signup">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer px-10 py-5 bg-white text-primary rounded-xl font-semibold text-lg shadow-2xl hover:shadow-3xl transition-all"
            >
              Get Started Free
            </motion.button>
          </Link>
        </motion.div>
      </section>

    </div>
  );
}
