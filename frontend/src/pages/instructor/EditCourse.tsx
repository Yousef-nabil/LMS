import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useNavigate, useParams } from "react-router";
import { courseService } from "../../api/services/courseService";
import { Loader2, Save } from "lucide-react";
import AlertCard from "../../components/AlertCard";

export function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [courseData, setCourseData] = useState<{
    title: string;
    description: string;
    thumbnailUrl: string;
    price: any;
    thumbnail?: File;
  }>({
    title: "",
    description: "",
    thumbnailUrl: "",
    price: "" as any,
  });
  const [contents, setContents] = useState<any[]>([]);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!id) return;
      try {
        const [course, contentData] = await Promise.all([
          courseService.getCourseById(id),
          courseService.getCourseContent(id)
        ]);
        
        setCourseData({
          title: course.title,
          description: course.description || "",
          thumbnailUrl: course.thumbnailUrl || "",
          price: course.price ? Number(course.price) : 0,
        });
        setContents(contentData);
      } catch (err) {
        setError("Failed to load course data");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id]);

  const handleUpdate = async () => {
    if (!id || !courseData.title) {
      setError("Course title is required");
      return;
    }

    setSaving(true);
    setError(null);
    setUploadProgress(0);

    try {
      await courseService.updateCourse(
        id, 
        {
          ...courseData,
          price: Number(courseData.price),
        },
        (progress) => setUploadProgress(progress)
      );
      navigate("/instructor/my-courses");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update course");
    } finally {
      setSaving(false);
      setUploadProgress(0);
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
    <div className="max-w-4xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground mb-2">Edit Course</h1>
        <p className="text-muted-foreground">
          Update your course details and settings
        </p>
      </motion.div>

      {error && (
        <AlertCard 
          variant="error" 
          message={error} 
          onClose={() => setError(null)} 
        />
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
                disabled={saving}
              />
              <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${courseData.thumbnail ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                <div className="text-sm font-medium text-foreground truncate">
                  {courseData.thumbnail ? courseData.thumbnail.name : 'Select new thumbnail'}
                </div>
                {!courseData.thumbnail && <div className="text-xs text-muted-foreground">or leave to keep current</div>}
              </div>
            </div>
            {saving && uploadProgress > 0 && (
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
              onChange={(e) => setCourseData({ ...courseData, price: e.target.value })}
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
        transition={{ delay: 0.2 }}
        className="flex gap-4"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={saving}
          onClick={handleUpdate}
          className="flex-1 py-4 bg-primary text-primary-foreground rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="size-5 animate-spin" /> : (
            <>
              <Save className="size-5" />
              Save Changes
            </>
          )}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={saving}
          onClick={() => navigate("/instructor/my-courses")}
          className="px-8 py-4 bg-secondary text-secondary-foreground rounded-xl font-semibold hover:bg-secondary/80 transition-all"
        >
          Cancel
        </motion.button>
      </motion.div>
    </div>
  );
}
