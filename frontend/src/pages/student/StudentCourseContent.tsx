import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  Loader2,
  PlayCircle,
} from 'lucide-react';
import { courseService } from '../../api/services/courseService';
import type { Course, CourseContent } from '../../types';

type CourseLocationState = {
  course?: Course;
};

export function StudentCourseContent() {
  const { courseId = '' } = useParams();
  const location = useLocation();
  const state = (location.state as CourseLocationState | null) ?? null;

  const [content, setContent] = useState<CourseContent[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<CourseContent | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const course = state?.course;

  useEffect(() => {
    const fetchContent = async () => {
      if (!courseId) {
        setError('Invalid course identifier.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await courseService.getCourseContentById(courseId);
        setContent(data);

        const firstVideo = data.find(
          (item) => item.type === 'video' && item.fileUrl,
        );
        setSelectedVideo(firstVideo ?? null);
      } catch (err) {
        setError('Failed to load course content.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [courseId]);

  const sortedContent = useMemo(() => {
    return [...content].sort((a, b) =>
      (a.position ?? '').localeCompare(b.position ?? ''),
    );
  }, [content]);

  const openContent = (item: CourseContent) => {
    if (!item.fileUrl) {
      return;
    }

    if (item.type === 'video') {
      setSelectedVideo(item);
      return;
    }

    window.open(item.fileUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[360px] space-y-4">
        <Loader2 className="size-12 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse">
          Loading course content...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-destructive text-lg font-medium">{error}</p>
        <Link
          to="/student/dashboard"
          className="inline-flex mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-xl"
        >
          Back to My Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link
        to="/student/dashboard"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to My Courses
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border overflow-hidden"
      >
        <div className="md:flex">
          <div className="md:w-1/3 aspect-video md:aspect-auto bg-muted overflow-hidden">
            {course?.thumbnailUrl ? (
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/5 to-background flex items-center justify-center">
                <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                  {(course?.title ?? 'C').charAt(0)}
                </div>
              </div>
            )}
          </div>
          <div className="p-6 md:w-2/3 space-y-3">
            <p className="text-xs uppercase tracking-wide text-primary font-semibold">
              My Course
            </p>
            <h2 className="text-2xl font-semibold text-foreground">
              {course?.title ?? 'Course Content'}
            </h2>
            <p className="text-muted-foreground text-sm">
              {course?.description ?? 'Choose an item below to start learning.'}
            </p>
            <p className="text-sm text-muted-foreground">
              {course?.instructorName ? (
                <>
                  Instructor:{' '}
                  <span className="text-foreground font-medium">
                    {course.instructorName}
                  </span>
                </>
              ) : (
                'Instructor details are unavailable'
              )}
            </p>
          </div>
        </div>
      </motion.div>

      {selectedVideo?.fileUrl && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <h3 className="text-xl font-semibold text-foreground">
            Now Playing: {selectedVideo.title}
          </h3>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <video
              key={selectedVideo.id}
              controls
              className="w-full aspect-video bg-black"
              src={selectedVideo.fileUrl}
            >
              Your browser does not support the video tag.
            </video>
            <div className="p-4 border-t border-border">
              <button
                onClick={() =>
                  window.open(
                    selectedVideo.fileUrl,
                    '_blank',
                    'noopener,noreferrer',
                  )
                }
                className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground font-medium cursor-pointer"
              >
                <ExternalLink className="size-4" />
                Open in New Tab
              </button>
            </div>
          </div>
        </motion.section>
      )}

      {sortedContent.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          No content has been uploaded for this course yet.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedContent.map((item, idx) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              whileHover={{ y: -6 }}
              onClick={() => openContent(item)}
              className="text-left bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all h-full flex flex-col group cursor-pointer"
            >
              <div className="aspect-video w-full overflow-hidden relative">
                {item.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/5 to-background flex items-center justify-center">
                    <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                      {item.title.charAt(0)}
                    </div>
                  </div>
                )}
                <div className="absolute top-4 right-4 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg font-bold shadow-sm backdrop-blur-md capitalize">
                  {item.type}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <h4 className="text-lg font-semibold text-foreground mb-3 line-clamp-2">
                  {item.title}
                </h4>
                <div className="mt-auto inline-flex items-center gap-2 text-sm text-muted-foreground">
                  {item.type === 'video' ? (
                    <PlayCircle className="size-4" />
                  ) : (
                    <FileText className="size-4" />
                  )}
                  {item.fileUrl
                    ? item.type === 'video'
                      ? 'Play video'
                      : 'Open document'
                    : 'No file available'}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
