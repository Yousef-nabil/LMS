import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { motion } from "motion/react";
import { Loader2, ChevronLeft, CircleCheck, CircleX, AlertCircle } from "lucide-react";
import { courseService } from "../../api/services/courseService";
import { CourseMetadataForm } from "../../components/CourseMetadataForm";
import { CourseContentManager } from "../../components/CourseContentManager";
import AlertCard from "../../components/AlertCard";

export function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courseData, setCourseData] = useState<{
    title: string;
    description: string;
    thumbnailUrl: string;
    price: number;
    thumbnail?: File | null;
    isPublished?: boolean;
  }>({
    title: "",
    description: "",
    thumbnailUrl: "",
    price: 0,
    thumbnail: null,
  });

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!id) return;
      try {
        const course = await courseService.getCourseById(id);
        setCourseData({
          title: course.title,
          description: course.description || "",
          thumbnailUrl: course.thumbnailUrl || "",
          price: course.price ? Number(course.price) : 0,
          isPublished: course.isPublished ?? false,
        });
      } catch (err) {
        setError("Failed to load course data");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id]);

  const handleUpdate = async (data: {
    title: string;
    description: string;
    thumbnailUrl: string;
    price: string | number;
    thumbnail?: File | null;
  }) => {
    if (!id || !data.title.trim()) {
      setError("Course title is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await courseService.updateCourse(
        id,
        {
          title: data.title,
          description: data.description,
          thumbnailUrl: data.thumbnailUrl,
          price: Number(data.price),
        },
        () => {}
      );

      // Refresh local data after update
      const course = await courseService.getCourseById(id);
      setCourseData((prev) => ({
        ...prev,
        title: course.title,
        description: course.description || "",
        thumbnailUrl: course.thumbnailUrl || "",
        price: course.price ? Number(course.price) : 0,
      }));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update course");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!id) return;

    setPublishing(true);
    setError(null);

    try {
      const result = await courseService.publishCourse(id);
      setCourseData((prev) => ({
        ...prev,
        isPublished: !prev.isPublished,
      }));
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to toggle publish status"
      );
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 pb-20">
      {/* Top navigation */}
      <div className="flex items-center gap-4">
        <Link
          to="/instructor/my-courses"
          className="p-2 hover:bg-secondary rounded-full transition-colors"
        >
          <ChevronLeft className="size-6" />
        </Link>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Course Management</h2>
          <p className="text-muted-foreground text-sm">{courseData.title}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
              courseData.isPublished
                ? "bg-green-500/10 text-green-600"
                : "bg-yellow-500/10 text-yellow-600"
            }`}
          >
            {courseData.isPublished ? (
              <>
                <CircleCheck className="size-3" />
                Published
              </>
            ) : (
              <>
                <CircleX className="size-3" />
                Draft
              </>
            )}
          </span>
          <Link
            to={`/instructor/courses/${id}/view`}
            className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors"
          >
            <AlertCircle className="size-4" />
            Preview
          </Link>
        </div>
      </div>

      {error && (
        <AlertCard
          variant="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Metadata Form */}
      <CourseMetadataForm
        initialData={courseData}
        loading={saving}
        error={error}
        submitLabel="Save Changes"
        isPublished={courseData.isPublished}
        onTogglePublish={handleTogglePublish}
        toggleLoading={publishing}
        onCancel={() => navigate("/instructor/my-courses")}
        onSubmit={handleUpdate}
      />

      {/* Content Manager */}
      <CourseContentManager courseId={id!} />
    </div>
  );
}