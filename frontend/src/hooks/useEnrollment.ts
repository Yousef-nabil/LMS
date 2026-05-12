import { useState, useEffect, useCallback } from "react";
import { courseService } from "../api/services/courseService";
import type { EnrollmentCheckResponse, Enrollment, CreateEnrollmentRequest } from "../types/course";

interface UseEnrollmentResult {
  isEnrolled: boolean;
  enrollment: Enrollment | null;
  isLoading: boolean;
  error: string | null;
  checkEnrollment: (courseId: string) => Promise<void>;
  enroll: (courseId: string) => Promise<void>;
  unenroll: (enrollmentId: string) => Promise<void>;
}

export function useEnrollment(courseId?: string): UseEnrollmentResult {
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkEnrollmentFn = useCallback(
    async (courseIdToCheck: string) => {
      if (!courseIdToCheck) return;
      setIsLoading(true);
      setError(null);
      try {
        const result: EnrollmentCheckResponse =
          await courseService.checkEnrollment(courseIdToCheck);
        setIsEnrolled(result.isEnrolled);
        setEnrollment(result.enrollment);
      } catch (err) {
        setError("Failed to check enrollment status");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const enroll = useCallback(
    async (courseIdToEnroll: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const result: { data: Enrollment } =
          await courseService.enrollCourse({ courseId: courseIdToEnroll });
        setIsEnrolled(true);
        setEnrollment(result.data);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Failed to enroll in course"
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const unenroll = useCallback(
    async (enrollmentId: string) => {
      setIsLoading(true);
      setError(null);
      try {
        await courseService.unenrollCourse(enrollmentId);
        setIsEnrolled(false);
        setEnrollment(null);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Failed to unenroll from course"
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (courseId) {
      checkEnrollmentFn(courseId);
    }
  }, [courseId, checkEnrollmentFn]);

  return {
    isEnrolled,
    enrollment,
    isLoading,
    error,
    checkEnrollment: checkEnrollmentFn,
    enroll,
    unenroll,
  };
}