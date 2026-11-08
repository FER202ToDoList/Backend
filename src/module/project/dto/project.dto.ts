import { PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  Matches,
  ValidateIf,
} from 'class-validator';
export class CreateProjectDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  name: string;
  @ValidateIf((_, value) => value !== undefined)
  @Matches(/^#[0-9a-f]{6}$/i)
  color?: string;
}

export class UpdateProjectDto extends PartialType(CreateProjectDto, {
  skipNullProperties: false,
}) {}
