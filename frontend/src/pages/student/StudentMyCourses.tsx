import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { BookOpen, Loader2, Search } from 'lucide-react';
import { courseService } from '../../api/services/courseService';
import { useDebounce } from '../../hooks/useDebounce';
import type { Course } from '../../types';

export function StudentMyCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await courseService.getMyEnrolledCourses(
          currentPage,
          coursesPerPage,
          debouncedSearchTerm,
        );
        setCourses(data);
      } catch (err) {
        setError('Failed to load your courses. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [currentPage, debouncedSearchTerm]);

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
            placeholder="Search your enrolled courses..."
            className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </div>
      </motion.div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[360px] space-y-4">
          <Loader2 className="size-12 text-primary animate-spin" />
          <p className="text-muted-foreground animate-pulse">
            Loading your courses...
          </p>
        </div>
      ) : courses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="mx-auto mb-4 size-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="size-8 text-primary" />
          </div>
          <p className="text-muted-foreground text-lg">
            No enrolled courses found
          </p>
        </motion.div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * idx }}
                whileHover={{ y: -6 }}
              >
                <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all h-full flex flex-col group">
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
                      Enrolled
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
                      by{' '}
                      <span className="font-medium text-foreground">
                        {course.instructorName}
                      </span>
                    </div>

                    <Link
                      to={`/student/courses/${course.id}`}
                      state={{ course }}
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all cursor-pointer"
                      >
                        Open Course
                      </motion.button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

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
        </>
      )}
    </div>
  );
}
