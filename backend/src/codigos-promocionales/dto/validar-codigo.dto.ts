import { Transform, Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ValidarCodigoDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @IsNotEmpty()
  codigo!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  subtotal?: number;
}
