import { Test, TestingModule } from '@nestjs/testing';
import { InstructorController } from './instructor.controller';
import { InstructorService } from './instructor.service';

describe('InstructorController', () => {
  let controller: InstructorController;
  let service: {
    findCourses: jest.Mock;
    getCourseOverview: jest.Mock;
    getCourseStudents: jest.Mock;
    getCoursePayments: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      findCourses: jest.fn(),
      getCourseOverview: jest.fn(),
      getCourseStudents: jest.fn(),
      getCoursePayments: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstructorController],
      providers: [{ provide: InstructorService, useValue: service }],
    }).compile();

    controller = module.get<InstructorController>(InstructorController);
  });

  describe('getCourses', () => {
    it('should return courses', async () => {
      const mockCourses = [{ id: '1', title: 'Course 1' }];
      service.findCourses.mockResolvedValue(mockCourses);

      const result = await controller.getCourses({ user: { sub: '1' } });

      expect(service.findCourses).toHaveBeenCalledWith(BigInt(1));
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCourses);
    });
  });

  describe('getCourseOverview', () => {
    it('should return course overview', async () => {
      const mockOverview = { enrollmentsCount: 10, revenue: '1000' };
      service.getCourseOverview.mockResolvedValue(mockOverview);

      const result = await controller.getCourseOverview(
        { user: { sub: '1' } },
        '1',
      );

      expect(service.getCourseOverview).toHaveBeenCalledWith(
        BigInt(1),
        BigInt(1),
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockOverview);
    });
  });

  describe('getCourseStudents', () => {
    it('should return course students', async () => {
      const mockStudents = [{ id: '1', name: 'Student 1' }];
      service.getCourseStudents.mockResolvedValue(mockStudents);

      const result = await controller.getCourseStudents(
        { user: { sub: '1' } },
        '1',
      );

      expect(service.getCourseStudents).toHaveBeenCalledWith(
        BigInt(1),
        BigInt(1),
        0,
        10,
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockStudents);
    });
  });

  describe('getCoursePayments', () => {
    it('should return course payments', async () => {
      const mockPayments = [{ id: '1', amount: '100' }];
      service.getCoursePayments.mockResolvedValue(mockPayments);

      const result = await controller.getCoursePayments(
        { user: { sub: '1' } },
        '1',
      );

      expect(service.getCoursePayments).toHaveBeenCalledWith(
        BigInt(1),
        BigInt(1),
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPayments);
    });
  });
});
