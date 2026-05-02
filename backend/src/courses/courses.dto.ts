import { IsOptional, IsInt, IsPositive, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

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