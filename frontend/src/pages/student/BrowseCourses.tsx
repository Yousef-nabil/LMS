import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Search, CheckCircle2, X } from "lucide-react";
import { courseService } from "../../api/services/courseService";
import { useDebounce } from "../../hooks/useDebounce";
import type { Course } from "../../types";

export function BrowseCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [successCourseTitle, setSuccessCourseTitle] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const coursesPerPage = 6;

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const [allCourses, enrolledCourses] = await Promise.all([
          courseService.getAllCourses(
            currentPage,
            coursesPerPage,
            debouncedSearchTerm,
          ),
          courseService.getMyEnrolledCourses(1, 100),
        ]);

        setCourses(allCourses);
        setEnrolledCourseIds(
          new Set(enrolledCourses.map((course) => course.id)),
        );
      } catch (err) {
        setError("Failed to load courses. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [currentPage, debouncedSearchTerm]);

  const handleEnroll = async (course: Course) => {
    try {
      setEnrollingCourseId(course.id);
      setErrorMessage(null);

      const result = await courseService.enrollInCourse(course.id);
      setEnrolledCourseIds((current) => new Set(current).add(course.id));
      setSuccessCourseTitle(course.title);
      setSuccessMessage(result.message);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message ||
          "Failed to enroll in course. Please try again.",
      );
    } finally {
      setEnrollingCourseId(null);
    }
  };

  // filteredCourses is no longer needed locally as the server handles filtering
  const displayCourses = courses;

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-destructive text-lg font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-xl"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search courses..."
            className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </div>
      </motion.div>

      {/* Course Grid / Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <Loader2 className="size-12 text-primary animate-spin" />
          <p className="text-muted-foreground animate-pulse">Loading amazing courses...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayCourses.map((course, idx) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx }}
              whileHover={{ y: -6 }}
            >
              <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all h-full flex flex-col group">
                {/* Course Thumbnail */}
                <div className="aspect-video w-full overflow-hidden relative">
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/5 to-background flex items-center justify-center">
                      <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                        {course.title.charAt(0)}
                      </div>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg font-bold shadow-sm backdrop-blur-md">
                    ${course.price || "Free"}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  
                  <h3 className="text-xl font-semibold text-foreground mb-3 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                    {course.description}
                  </p>
                  <div className="text-sm text-muted-foreground mb-6">
                    by <span className="font-medium text-foreground">{course.instructorName}</span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleEnroll(course)}
                    disabled={
                      enrollingCourseId === course.id ||
                      enrolledCourseIds.has(course.id)
                    }
                    className={`w-full py-3 rounded-xl font-semibold shadow-lg transition-all flex items-center justify-center gap-2 ${
                      enrolledCourseIds.has(course.id)
                        ? "bg-secondary text-secondary-foreground shadow-none cursor-not-allowed"
                        : "bg-primary text-primary-foreground shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                    }`}
                  >
                    {enrolledCourseIds.has(course.id) ? (
                      "Enrolled"
                    ) : enrollingCourseId === course.id ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Enrolling...
                      </>
                    ) : (
                      "Enroll Now"
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && displayCourses.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <p className="text-muted-foreground text-lg">No courses found matching your criteria</p>
        </motion.div>
      )}

      {/* Pagination Controls */}
      {!loading && (
        <div className="flex items-center justify-center space-x-4 mt-12">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-6 py-2 bg-card border border-border rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition-colors cursor-pointer"
          >
            Previous
          </button>
          <span className="text-sm font-medium">Page {currentPage}</span>
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={courses.length < coursesPerPage}
            className="px-6 py-2 bg-card border border-border rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition-colors cursor-pointer"
          >
            Next
          </button>
        </div>
      )}

      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setSuccessMessage(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="w-full max-w-md rounded-3xl border border-border bg-card shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <CheckCircle2 className="size-6" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                        Enrollment confirmed
                      </p>
                      <h3 className="text-2xl font-bold text-foreground">
                        You’re in
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setSuccessMessage(null)}
                    className="rounded-full p-2 text-muted-foreground hover:bg-secondary transition-colors"
                    aria-label="Close success dialog"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {successMessage}
                  </p>
                  {successCourseTitle && (
                    <div className="rounded-2xl border border-border bg-secondary/40 px-4 py-3">
                      <p className="text-sm font-medium text-foreground">
                        {successCourseTitle}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        It has been added to your enrolled courses.
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setSuccessMessage(null)}
                  className="w-full rounded-2xl bg-primary px-4 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
                >
                  Continue browsing
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setErrorMessage(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="w-full max-w-md rounded-3xl border border-border bg-card shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
                      <X className="size-6" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                        Enrollment issue
                      </p>
                      <h3 className="text-2xl font-bold text-foreground">
                        Couldn’t enroll
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setErrorMessage(null)}
                    className="rounded-full p-2 text-muted-foreground hover:bg-secondary transition-colors"
                    aria-label="Close error dialog"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <p className="text-sm text-muted-foreground">{errorMessage}</p>

                <button
                  onClick={() => setErrorMessage(null)}
                  className="w-full rounded-2xl bg-secondary px-4 py-3 font-semibold text-secondary-foreground transition-all hover:bg-secondary/80"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
