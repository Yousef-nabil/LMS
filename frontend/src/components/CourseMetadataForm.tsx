import { useState, useRef } from "react";
import { motion } from "motion/react";
import { Loader2, XCircle } from "lucide-react";

interface CourseMetadataFormProps {
  initialData?: {
    title: string;
    description: string;
    thumbnailUrl: string;
    price: number | string;
    thumbnail?: File | null;
    isPublished?: boolean;
  };
  loading: boolean;
  error: string | null;
  submitLabel: string;
  onSubmit: (data: {
    title: string;
    description: string;
    thumbnailUrl: string;
    price: string | number;
    thumbnail?: File | null;
    isPublished?: boolean;
  }) => void;
  onCancel?: () => void;
  secondaryAction?: {
    label: string;
    onClick: () => void;
    loading?: boolean;
  };
  isPublished?: boolean;
  onTogglePublish?: () => void;
  toggleLoading?: boolean;
}

export function CourseMetadataForm({
  initialData,
  loading,
  error,
  submitLabel,
  onSubmit,
  onCancel,
  secondaryAction,
  isPublished = false,
  onTogglePublish,
  toggleLoading = false,
}: CourseMetadataFormProps) {
  const [courseData, setCourseData] = useState({
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    thumbnailUrl: initialData?.thumbnailUrl ?? "",
    price: initialData?.price ?? "",
    thumbnail: initialData?.thumbnail ?? null,
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [internalError, setInternalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseData.title.trim()) {
      setInternalError("Course title is required");
      return;
    }
    setInternalError(null);
    onSubmit({
      ...courseData,
      price: Number(courseData.price),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header with publish status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {initialData ? "Edit Course" : "Create New Course"}
          </h1>
          <p className="text-muted-foreground">
            {initialData
              ? "Update your course details and settings"
              : "Build your course by adding lessons, quizzes, and details"}
          </p>
        </div>
        {onTogglePublish && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={onTogglePublish}
            disabled={toggleLoading}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              isPublished
                ? "bg-green-500/10 text-green-600 border border-green-500/30 hover:bg-green-500/20"
                : "bg-yellow-500/10 text-yellow-600 border border-yellow-500/30 hover:bg-yellow-500/20"
            }`}
          >
            {toggleLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : isPublished ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Published
              </>
            ) : (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="inline-flex rounded-full h-2 w-2 bg-yellow-400"></span>
                </span>
                Draft
              </>
            )}
          </motion.button>
        )}
      </div>

      {(error || internalError) && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm flex items-start gap-3">
          <XCircle className="size-5 mt-0.5 shrink-0" />
          <span>{error || internalError}</span>
        </div>
      )}

      {/* Course Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card p-6 rounded-2xl border border-border space-y-6"
      >
        <h2 className="text-xl font-semibold text-foreground">Course Details</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-2">Course Title</label>
            <input
              type="text"
              value={courseData.title}
              onChange={(e) =>
                setCourseData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="e.g., Complete Web Development"
              className="w-full px-4 py-3 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Description</label>
          <textarea
            rows={4}
            value={courseData.description}
            onChange={(e) =>
              setCourseData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            placeholder="Describe what students will learn..."
            className="w-full px-4 py-3 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Thumbnail</label>
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setCourseData((prev) => ({
                    ...prev,
                    thumbnail: e.target.files?.[0] ?? null,
                  }))
                }
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={loading}
              />
              <div
                className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors cursor-pointer ${
                  courseData.thumbnail
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-sm font-medium text-foreground truncate">
                  {courseData.thumbnail
                    ? courseData.thumbnail.name
                    : initialData?.thumbnailUrl
                    ? "Current thumbnail — click to change"
                    : "Select thumbnail image"}
                </div>
                {!courseData.thumbnail && !initialData?.thumbnailUrl && (
                  <div className="text-xs text-muted-foreground mt-1">
                    This is how students find your course
                  </div>
                )}
                {!courseData.thumbnail && initialData?.thumbnailUrl && (
                  <div className="text-xs text-muted-foreground mt-1">
                    or leave to keep current
                  </div>
                )}
              </div>
            </div>
            {loading && uploadProgress > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-[10px] font-medium">
                  <span className="text-primary">Uploading thumbnail...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-1 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>
            )}
            {courseData.thumbnailUrl && !courseData.thumbnail && (
              <div className="mt-2">
                <img
                  src={courseData.thumbnailUrl}
                  alt="Current thumbnail"
                  className="w-20 h-12 object-cover rounded-lg border border-border"
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Price ($)</label>
            <input
              type="number"
              value={courseData.price}
              onChange={(e) =>
                setCourseData((prev) => ({
                  ...prev,
                  price: e.target.value,
                }))
              }
              placeholder="99.99"
              step="0.01"
              min="0"
              className="w-full px-4 py-3 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>
        </div>
      </motion.div>

      {/* Submit Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex gap-4"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          type="submit"
          className="flex-1 py-4 bg-primary text-primary-foreground rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            submitLabel
          )}
        </motion.button>
        {onCancel && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            type="button"
            onClick={onCancel}
            className="px-8 py-4 bg-secondary text-secondary-foreground rounded-xl font-semibold hover:bg-secondary/80 transition-all"
          >
            Cancel
          </motion.button>
        )}
        {secondaryAction && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={secondaryAction.loading}
            type="button"
            onClick={secondaryAction.onClick}
            className="px-8 py-4 bg-secondary text-secondary-foreground rounded-xl font-semibold hover:bg-secondary/80 transition-all flex items-center gap-2"
          >
            {secondaryAction.loading && (
              <Loader2 className="size-4 animate-spin" />
            )}
            {secondaryAction.label}
          </motion.button>
        )}
      </motion.div>
    </form>
  );
}