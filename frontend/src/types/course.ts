export type ContentType = 'video' | 'document';

export interface CourseContent {
  id: string;
  courseId: string;
  title: string;
  type: ContentType;
  fileUrl?: string;
  fileSize?: string;
  position?: string;
  thumbnailUrl?: string;
}

export interface Course {
  id: string;
  instructorName: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  price: string | null;
  createdAt: string;
  enrollmentsCount?: number;
  isPublished?: boolean;
  isEnrolled?: boolean;
}

export interface LessonCreate {
  title: string;
  type: 'video' | 'document';
  file_url?: string;
  file_size?: number;
  thumbnail_url?: string;
}

export interface QuizCreate {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface CreateCourseRequest {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  price?: number;
  isPublished?: boolean;
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {
  price: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
}

export interface CourseDetail extends Course {
  id: string;
  instructorId: string;
  content: CourseContent[];
}

// Enrollment types
export interface Enrollment {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  paymentId: string | null;
  enrollmentDate: string;
}

export interface EnrollmentCheckResponse {
  isEnrolled: boolean;
  enrollment: Enrollment | null;
}

export interface CreateEnrollmentRequest {
  courseId: string;
  status?: 'pending' | 'completed' | 'failed' | 'refunded';
}