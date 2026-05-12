import apiClient from "../client";
import type {
  Course,
  CreateCourseRequest,
  UpdateCourseRequest,
  CourseContent,
  Enrollment,
  EnrollmentCheckResponse,
  CreateEnrollmentRequest,
} from "../../types";

type RawCourseContent = {
  id: string;
  course_id: string;
  title: string;
  type: "video" | "document";
  file_url?: string | null;
  file_size?: string | null;
  position?: string | null;
  thumbnail_url?: string | null;
};

const normalizeCourseContent = (
  content: RawCourseContent,
): CourseContent => ({
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
  async getInstructorCourses(): Promise<Course[]> {
    const response = await apiClient.get("/courses/instructor/my-courses");
    return response.data.data;
  },

  async getCourseById(id: string): Promise<Course> {
    const response = await apiClient.get(`/courses/${id}`);
    return response.data.data;
  },

  async getCourseContent(id: string): Promise<any[]> {
    const response = await apiClient.get(`/courses/${id}/content`);
    return response.data.data;
  },

  async getCourseContentById(id: string): Promise<CourseContent[]> {
    const response = await apiClient.get(`/courses/${id}/content`);
    const payload = response.data?.data ?? [];

    return payload.map((item: RawCourseContent) =>
      normalizeCourseContent(item),
    );
  },

  async getAllCourses(
    page = 1,
    limit = 6,
    search?: string,
  ): Promise<Course[]> {
    const response = await apiClient.get("/courses", {
      params: { page, limit, search },
    });

    return response.data;
  },

  async getMyEnrolledCourses(
    page = 1,
    limit = 6,
    search?: string,
  ): Promise<Course[]> {
    const response = await apiClient.get("/courses/me/enrolled", {
      params: { page, limit, search },
    });

    return response.data;
  },

  async createCourse(
    data: CreateCourseRequest,
    onProgress?: (progress: number) => void,
  ): Promise<Course> {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      const value = data[key as keyof CreateCourseRequest];

      if (value !== undefined) {
        formData.append(key, value as any);
      }
    });

    const response = await apiClient.post("/courses", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress(
            Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            ),
          );
        }
      },
    });

    return response.data.data;
  },

  async updateCourse(
    id: string,
    data: UpdateCourseRequest,
    onProgress?: (progress: number) => void,
  ): Promise<Course> {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      const value = data[key as keyof UpdateCourseRequest];

      if (value !== undefined) {
        formData.append(key, value as any);
      }
    });

    const response = await apiClient.put(`/courses/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress(
            Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            ),
          );
        }
      },
    });

    return response.data.data;
  },

  async deleteCourse(id: string): Promise<void> {
    await apiClient.delete(`/courses/${id}`);
  },

  async publishCourse(id: string): Promise<Course> {
    const response = await apiClient.put(`/courses/${id}/publish`);
    return response.data.data;
  },

  async deleteContent(
    courseId: string,
    contentId: string,
  ): Promise<void> {
    await apiClient.delete(`/courses/${courseId}/items/${contentId}`);
  },

  async createContent(
    courseId: string,
    data: any,
    onProgress?: (progress: number) => void,
  ) {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    const response = await apiClient.post(
      `/courses/${courseId}/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );

            onProgress(percentCompleted);
          }
        },
      },
    );

    return response.data;
  },

  async reorderContent(
    courseId: string,
    contentId: string,
    prevId: string | null,
    nextId: string | null,
  ) {
    const response = await apiClient.put(
      `/courses/${courseId}/reorder`,
      {
        contentId: Number(contentId),
        prevId: prevId ? Number(prevId) : null,
        nextId: nextId ? Number(nextId) : null,
      },
    );

    return response.data;
  },

  async checkEnrollment(courseId: string): Promise<EnrollmentCheckResponse> {
    const response = await apiClient.get(
      `/courses/${courseId}/enrollment-status`
    );
    return response.data.data;
  },

  async enrollCourse(
    data: CreateEnrollmentRequest
  ): Promise<{ data: Enrollment }> {
    const response = await apiClient.post("/enrollments", data);
    return response.data;
  },

  async unenrollCourse(enrollmentId: string): Promise<void> {
    await apiClient.delete(`/enrollments/${enrollmentId}`);
  },
};