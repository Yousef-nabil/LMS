import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { Plus, Trash2, Home, BookOpen, Users, DollarSign } from "lucide-react";
import { courseService } from "../../api/services/courseService";
import { ConfirmModal } from "../../components/ConfirmModal";
import type { Course } from "../../types/course";

export function InstructorMyCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseService.getInstructorCourses();
        setCourses(data);
      } catch (err) {
        console.error("Failed to fetch courses", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleDeleteCourse = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await courseService.deleteCourse(deleteId);
      setCourses(courses.filter(c => c.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      console.error("Failed to delete course", err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="size-10 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Courses</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor your teaching journey.</p>
        </div>
        <Link to="/instructor/create">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg shadow-primary/20"
          >
            <Plus className="size-5" />
            Create New Course
          </motion.button>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {courses.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border">
            <div className="text-muted-foreground mb-4">You haven't created any courses yet.</div>
            <Link to="/instructor/create">
              <span className="text-primary font-medium hover:underline">Start creating your first course</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {courses.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col h-full group"
              >
                <Link to={`/instructor/manage/${course.id}`} className="flex flex-col sm:flex-row flex-1">
                  <div className="sm:w-2/5 aspect-video sm:aspect-auto bg-secondary/30 overflow-hidden relative">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs p-4 text-center italic">
                        No Thumbnail
                      </div>
                    )}
                    <div className="absolute top-2 right-2 px-2 py-1 bg-background/80 backdrop-blur-sm rounded-md text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20">
                      Manage
                    </div>
                  </div>
                  <div className="sm:w-3/5 p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-3 line-clamp-2 min-h-[3.5rem] group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                            <Users className="size-4" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-foreground">
                              {(course.enrollmentsCount || 0).toLocaleString()}
                            </div>
                            <div className="text-[10px] text-muted-foreground uppercase font-medium">Students</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                            <DollarSign className="size-4" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-foreground">${course.price || "0"}</div>
                            <div className="text-[10px] text-muted-foreground uppercase font-medium">Price</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
                
                <div className="px-6 pb-6 pt-2 flex gap-2">
                  <Link to={`/instructor/edit/${course.id}`} className="flex-1">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-2.5 bg-secondary text-secondary-foreground rounded-xl font-medium hover:bg-secondary/80 transition-all text-sm flex items-center justify-center gap-2"
                    >
                      Edit Details
                    </motion.button>
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDeleteId(course.id)}
                    className="p-2.5 text-muted-foreground hover:text-destructive transition-colors bg-secondary/50 rounded-xl border border-transparent hover:border-destructive/20"
                  >
                    <Trash2 className="size-5" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteCourse}
        isLoading={isDeleting}
        title="Delete Course"
        message="Are you sure you want to delete this course? This action will permanently remove the course and all its content. This cannot be undone."
      />
    </div>
  );
}
