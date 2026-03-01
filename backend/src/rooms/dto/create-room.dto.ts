import {
  IsString,
  IsBoolean,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsEnum,
} from 'class-validator';

enum EducationLevel {
  SCHOOL = 'SCHOOL',
  AL = 'AL',
  UNI = 'UNI',
}

enum Medium {
  SINHALA = 'SINHALA',
  TAMIL = 'TAMIL',
  ENGLISH = 'ENGLISH',
}

export class CreateRoomDto {
  @IsString()
  name: string;

  @IsString()
  subject: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsString()
  @IsOptional()
  password?: string;

  @IsInt()
  @Min(2)
  @Max(20)
  @IsOptional()
  maxCapacity?: number;

  @IsEnum(EducationLevel)
  educationLevel: EducationLevel;

  @IsEnum(Medium)
  @IsOptional()
  medium?: Medium;

  @IsInt()
  @Min(6)
  @Max(13)
  @IsOptional()
  grade?: number;

  @IsString()
  @IsOptional()
  stream?: string;
}