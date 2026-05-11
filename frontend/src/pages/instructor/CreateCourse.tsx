import  { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { courseService } from "../../api/services/courseService";
import { Loader2 } from "lucide-react";

export function CreateCourse() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [courseData, setCourseData] = useState<{
    title: string;
    description: string;
    thumbnailUrl: string;
    price: number;
    thumbnail?: File;
  }>({
    title: "",
    description: "",
    thumbnailUrl: "",
    price: "" as any,
  });


  const handlePublish = async (_isDraft = false) => {
    if (!courseData.title) {
      setError("Course title is required");
      return;
    }

    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      await courseService.createCourse(
        {
          ...courseData,
          price: Number(courseData.price),
        },
        (progress) => setUploadProgress(progress)
      );
      
      navigate("/instructor/my-courses");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create course");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground mb-2">Create New Course</h1>
        <p className="text-muted-foreground">
          Build your course by adding lessons, quizzes, and details
        </p>
      </motion.div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Course Details */}
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
              onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
              placeholder="e.g., Complete Web Development"
              className="w-full px-4 py-3 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Description</label>
          <textarea
            rows={4}
            value={courseData.description}
            onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
            placeholder="Describe what students will learn..."
            className="w-full px-4 py-3 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Thumbnail</label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCourseData({ ...courseData, thumbnail: e.target.files?.[0] })}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={loading}
              />
              <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${courseData.thumbnail ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                <div className="text-sm font-medium text-foreground truncate">
                  {courseData.thumbnail ? courseData.thumbnail.name : 'Select thumbnail image'}
                </div>
                {!courseData.thumbnail && <div className="text-xs text-muted-foreground">This is how students find your course</div>}
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
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Price ($)</label>
            <input
              type="number"
              value={courseData.price}
              onChange={(e) => setCourseData({ ...courseData, price: e.target.value as any })}
              placeholder="99.99"
              className="w-full px-4 py-3 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>
        </div>
      </motion.div>


      {/* Submit */}
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
          onClick={() => handlePublish(false)}
          className="flex-1 py-4 bg-primary text-primary-foreground rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="size-5 animate-spin" /> : "Publish Course"}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          onClick={() => handlePublish(true)}
          className="px-8 py-4 bg-secondary text-secondary-foreground rounded-xl font-semibold hover:bg-secondary/80 transition-all"
        >
          Save Draft
        </motion.button>
      </motion.div>
    </div>
  );
}
