import { Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
  IsUUID,
  Matches,
  IsDateString,
  ValidateIf,
} from 'class-validator';
import { PartialType } from '@nestjs/swagger';
export class CreateTaskDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @ValidateIf((o, value) => value !== undefined)
  @IsBoolean()
  isCompleted?: boolean;
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  dueDate?: string | null;
  @ValidateIf((o, value) => value !== undefined)
  @IsInt()
  @Min(1)
  @Max(4)
  priority?: number;
  @IsOptional() @IsUUID() projectId?: string | null;
}
export class UpdateTaskDto extends PartialType(CreateTaskDto, {
  skipNullProperties: false,
}) {}
