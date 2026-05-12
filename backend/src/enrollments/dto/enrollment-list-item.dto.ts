export class EnrollmentListItemDto {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  paymentId: string | null;
  enrollmentDate: string;
}