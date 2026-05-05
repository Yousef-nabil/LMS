export class InstructorCourseListItemDto {
  id: string;
  title: string;
  price: string | null;
  enrollmentsCount: number;
  revenue: string; // formatted
  createdAt: string;
}
