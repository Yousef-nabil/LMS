import apiClient from "../client";
import type { Course } from "../../types";

export const courseService = {
  getAllCourses: async (page = 1, limit = 6, search?: string): Promise<Course[]> => {
    const response = await apiClient.get("/courses", {
      params: { page, limit, search },
    });
    return response.data;
  },

  getCourseById: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/courses/${id}/content`);
    return response.data;
  },
};
