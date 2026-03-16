import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateLegalTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsArray()
  @IsOptional()
  placeholders?: string[];

  @IsString()
  @IsOptional()
  aiPrompt?: string;
}

export class UpdateLegalTemplateDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsArray()
  @IsOptional()
  placeholders?: string[];

  @IsString()
  @IsOptional()
  aiPrompt?: string;
}

export class GenerateFromTemplateDto {
  @IsString()
  @IsNotEmpty()
  templateId: string;

  @IsString()
  @IsNotEmpty()
  matterId: string;

  @IsOptional()
  customVariables?: Record<string, string>;
}

export class RefineDocumentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  instruction: string;
}

export class SaveToMatterDto {
  @IsString()
  @IsNotEmpty()
  matterId: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  filename: string;
}

export class DownloadPdfDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  filename: string;
}
