import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class CreateCodigoPromocionalDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[0-9])[A-Z0-9_-]+$/, {
    message: 'El código debe estar en mayúsculas y contener al menos un número (ej. DESC10, PROMO2024)',
  })
  codigo!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  descuento!: number;

  @IsBoolean()
  esPorcentaje!: boolean;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    if (!trimmed) return undefined;

    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
  })
  @IsDateString()
  fechaExpiracion?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100000)
  usosMaximos?: number;
}

