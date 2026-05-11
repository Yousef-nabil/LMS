import apiClient from '../client';
import type { Course, CourseContent } from '../../types';

type RawCourseContent = {
  id: string;
  course_id: string;
  title: string;
  type: 'video' | 'document';
  file_url?: string | null;
  file_size?: string | null;
  position?: string | null;
  thumbnail_url?: string | null;
};

const normalizeCourseContent = (content: RawCourseContent): CourseContent => ({
  id: String(content.id),
  courseId: String(content.course_id),
  title: content.title,
  type: content.type,
  fileUrl: content.file_url ?? undefined,
  fileSize: content.file_size ?? undefined,
  position: content.position ?? undefined,
  thumbnailUrl: content.thumbnail_url ?? undefined,
});

export const courseService = {
  getAllCourses: async (
    page = 1,
    limit = 6,
    search?: string,
  ): Promise<Course[]> => {
    const response = await apiClient.get('/courses', {
      params: { page, limit, search },
    });
    return response.data;
  },

  getMyEnrolledCourses: async (
    page = 1,
    limit = 6,
    search?: string,
  ): Promise<Course[]> => {
    const response = await apiClient.get('/courses/me/enrolled', {
      params: { page, limit, search },
    });
    return response.data;
  },

  getCourseContentById: async (id: string): Promise<CourseContent[]> => {
    const response = await apiClient.get(`/courses/${id}/content`);
    const payload = response.data?.data ?? [];
    return payload.map((item: RawCourseContent) =>
      normalizeCourseContent(item),
    );
  },
};
