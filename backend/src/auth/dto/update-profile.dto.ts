import { IsString, IsOptional, IsEnum, IsInt, Min, Max, IsArray } from 'class-validator';

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

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(EducationLevel)
  @IsOptional()
  educationLevel?: EducationLevel;

  @IsEnum(Medium)
  @IsOptional()
  medium?: Medium;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  subjects?: string[];

  // School fields
  @IsInt()
  @Min(6)
  @Max(11)
  @IsOptional()
  grade?: number;

  @IsString()
  @IsOptional()
  schoolName?: string;

  @IsString()
  @IsOptional()
  city?: string;

  // A/L fields
  @IsString()
  @IsOptional()
  stream?: string;

  // University fields
  @IsString()
  @IsOptional()
  universityName?: string;

  @IsString()
  @IsOptional()
  course?: string;

  @IsInt()
  @Min(1)
  @Max(4)
  @IsOptional()
  yearOfStudy?: number;
}