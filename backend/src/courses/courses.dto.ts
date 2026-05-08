import {
    IsOptional,
    IsInt,
    IsPositive,
    IsNotEmpty,
    IsString,
    IsEnum,
    IsUrl,
    MaxLength,
    IsNumber,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

enum ContentType {
    video = 'video',
    document = 'document',
    quiz = 'quiz',
    assignment = 'assignment',
}

export class CreateContentDto {
    @IsNotEmpty({ message: 'title is required' })
    @IsString()
    @MaxLength(255)
    title: string;

    @IsNotEmpty({ message: 'type is required' })
    @IsEnum(ContentType, { message: 'type must be either video or document' })
    type: ContentType;

    @IsOptional()
    @Transform(({ value }) => (value === 'null' || value === 'undefined' || value === '' ? undefined : value))
    @IsUrl({}, { message: 'fileUrl must be a valid URL' })
    @MaxLength(500)
    fileUrl?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    fileSize?: number;

    @IsOptional()
    @Transform(({ value }) => (value === 'null' || value === 'undefined' || value === '' ? undefined : value))
    @IsUrl({}, { message: 'thumbnailUrl must be a valid URL' })
    thumbnailUrl?: string;
}

export class ReorderContentDto {
    @IsNotEmpty({ message: 'contentId is required' })
    @Type(() => Number)
    @IsInt({ message: 'contentId must be an integer' })
    @IsPositive({ message: 'contentId must be a positive number' })
    contentId: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'prevId must be an integer' })
    @IsPositive({ message: 'prevId must be a positive number' })
    prevId?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'nextId must be an integer' })
    @IsPositive({ message: 'nextId must be a positive number' })
    nextId?: number;
}

export class CreateCourseDto {
    @IsNotEmpty({ message: 'title is required' })
    @IsString()
    @MaxLength(255)
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @Transform(({ value }) => (value === 'null' || value === 'undefined' || value === '' ? undefined : value))
    @IsUrl({}, { message: 'thumbnailUrl must be a valid URL' })
    thumbnailUrl?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    price?: number;
}

export class UpdateCourseDto {
    @IsOptional()
    @IsString()
    @MaxLength(255)
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @Transform(({ value }) => (value === 'null' || value === 'undefined' || value === '' ? undefined : value))
    @IsUrl({}, { message: 'thumbnailUrl must be a valid URL' })
    thumbnailUrl?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    price?: number;
}