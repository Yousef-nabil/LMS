export class CourseListItemDto {
  id: string;
  instructorName: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  price: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
  enrollmentsCount?: number;
}
