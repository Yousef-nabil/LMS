import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Loader2, Plus } from "lucide-react";
import { courseService } from "../../api/services/courseService";
import { CourseMetadataForm } from "../../components/CourseMetadataForm";
import { CourseContentManager } from "../../components/CourseContentManager";
import AlertCard from "../../components/AlertCard";

type CreatePhase = "metadata" | "content";

export function CreateCourse() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<CreatePhase>("metadata");
  const [courseId, setCourseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateMetadata = async (data: {
    title: string;
    description: string;
    thumbnailUrl: string;
    price: string | number;
    thumbnail?: File | null;
  }) => {
    if (!data.title.trim()) {
      setError("Course title is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await courseService.createCourse(
        {
          title: data.title,
          description: data.description,
          thumbnailUrl: data.thumbnailUrl,
          price: Number(data.price),
          isPublished: false,
        },
        () => {}
      );

      setCourseId(response.id);
      setPhase("content");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (shouldPublish: boolean) => {
    if (!courseId) return;

    setPublishing(true);
    setError(null);

    try {
      await courseService.publishCourse(courseId);
      if (shouldPublish) {
        navigate("/instructor/my-courses");
      } else {
        navigate("/instructor/edit/" + courseId);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update course");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Create New Course
        </h1>
        <p className="text-muted-foreground">
          Build your course by adding lessons, quizzes, and details
        </p>
      </motion.div>

      {error && (
        <AlertCard
          variant="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {phase === "metadata" ? (
        <CourseMetadataForm
          loading={loading}
          error={error}
          submitLabel="Continue to Content"
          onSubmit={handleCreateMetadata}
          onCancel={() => navigate("/instructor/my-courses")}
        />
      ) : courseId ? (
        <>
          {/* Content Manager */}
          <CourseContentManager courseId={courseId} />

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-4 pt-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={publishing}
              onClick={() => handlePublish(false)}
              className="flex-1 py-4 bg-secondary text-secondary-foreground rounded-xl font-semibold hover:bg-secondary/80 transition-all flex items-center justify-center gap-2"
            >
              {publishing ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                "Save Draft"
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={publishing}
              onClick={() => handlePublish(true)}
              className="flex-1 py-4 bg-primary text-primary-foreground rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
            >
              {publishing ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <>
                  <Plus className="size-5" />
                  Publish Course
                </>
              )}
            </motion.button>
          </motion.div>
        </>
      ) : null}
    </div>
  );
}