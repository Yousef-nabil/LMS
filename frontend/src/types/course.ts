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
  price: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
}

export interface CourseDetail extends Course {
  id: string;
  instructorId: string;
  content: CourseContent[];
}
