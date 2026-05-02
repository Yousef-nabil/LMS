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
import { Type } from 'class-transformer';

enum ContentType {
    video = 'video',
    document = 'document',
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
    @IsUrl({}, { message: 'file_url must be a valid URL' })
    @MaxLength(500)
    file_url?: string;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    file_size?: number;

    @IsOptional()
    @IsUrl({}, { message: 'thumbnail_url must be a valid URL' })
    thumbnail_url?: string;
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