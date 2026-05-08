export interface Course {
  id: string;
  instructorName: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  price: string | null;
  createdAt: string;
  enrollmentsCount?: number;
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
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {}
