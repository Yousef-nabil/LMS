import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useParams, Link } from "react-router";
import { Loader2, ChevronLeft, AlertCircle } from "lucide-react";
import { courseService } from "../../api/services/courseService";
import { CourseContentManager } from "../../components/CourseContentManager";
import AlertCard from "../../components/AlertCard";

export function ManageCourse() {
  const { id } = useParams();
  const [course, setCourse] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      try {
        const courseData = await courseService.getCourseById(id);
        setCourse(courseData.title);
      } catch (err) {
        setError("Failed to load course data");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/instructor/my-courses"
          className="p-2 hover:bg-secondary rounded-full transition-colors"
        >
          <ChevronLeft className="size-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {course || "Course"}
          </h1>
          <p className="text-muted-foreground text-sm">
            Curriculum Builder & Content Management
          </p>
        </div>
      </div>

      {error && (
        <AlertCard
          variant="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Content Manager - Content only, no metadata editing */}
      <CourseContentManager courseId={id!} />
    </div>
  );
}