import {
  IsOptional,
  IsNotEmpty,
  IsString,
  IsPositive,
  IsInt,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { payment_status } from '@prisma/client';

export class CreateEnrollmentDto {
  @IsNotEmpty({ message: 'courseId is required' })
  @IsString()
  courseId: string;

  @IsOptional()
  @IsEnum(payment_status, { message: 'status must be a valid payment status' })
  status?: payment_status;
}

export class UpdateEnrollmentDto {
  @IsOptional()
  @IsEnum(payment_status, { message: 'status must be a valid payment status' })
  status?: payment_status;
}
