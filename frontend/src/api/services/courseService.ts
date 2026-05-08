import apiClient from "../client";
import type {
  Course,
  CreateCourseRequest,
  UpdateCourseRequest
} from "../../types/course";

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

  async getAllCourses(): Promise<Course[]> {
    const response = await apiClient.get("/courses");
    return response.data;
  },

  async createCourse(data: CreateCourseRequest, onProgress?: (progress: number) => void): Promise<Course> {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key as keyof CreateCourseRequest] !== undefined) {
        formData.append(key, data[key as keyof CreateCourseRequest] as any);
      }
    });

    const response = await apiClient.post("/courses", formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      },
    });
    return response.data.data;
  },

  async updateCourse(id: string, data: UpdateCourseRequest, onProgress?: (progress: number) => void): Promise<Course> {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key as keyof UpdateCourseRequest] !== undefined) {
        formData.append(key, data[key as keyof UpdateCourseRequest] as any);
      }
    });

    const response = await apiClient.put(`/courses/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      },
    });
    return response.data.data;
  },

  async deleteCourse(id: string): Promise<void> {
    await apiClient.delete(`/courses/${id}`);
  },

  async deleteContent(courseId: string, contentId: string): Promise<void> {
    await apiClient.delete(`/courses/${courseId}/items/${contentId}`);
  },

  async createContent(courseId: string, data: any, onProgress?: (progress: number) => void) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    const response = await apiClient.post(`/courses/${courseId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
    return response.data;
  },

  async reorderContent(courseId: string, contentId: string, prevId: string | null, nextId: string | null) {
    const response = await apiClient.put(`/courses/${courseId}/reorder`, {
      contentId: Number(contentId),
      prevId: prevId ? Number(prevId) : null,
      nextId: nextId ? Number(nextId) : null,
    });
    return response.data;
  }
};
