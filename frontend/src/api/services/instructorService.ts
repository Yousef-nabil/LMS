import api from '../client';

export const instructorService = {
  getCourses: async () => {
    const res = await api.get('/instructor/courses');
    return res.data;
  },

  getCourseOverview: async (id: string | number) => {
    const res = await api.get(`/instructor/courses/${id}/overview`);
    return res.data;
  },

  getCourseStudents: async (id: string | number, limit = 10, page = 1) => {
    const res = await api.get(`/instructor/courses/${id}/students`, {
      params: { limit, page },
    });
    return res.data;
  },

  getCoursePayments: async (id: string | number) => {
    const res = await api.get(`/instructor/courses/${id}/payments`);
    return res.data;
  },
};

export default instructorService;
