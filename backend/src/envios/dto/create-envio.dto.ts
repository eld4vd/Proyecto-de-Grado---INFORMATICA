import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsUUID,
  IsString,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { toTrimmedStringOrNull } from '../../common/utils/transforms.util';

export class CreateEnvioDto {
  @IsNotEmpty({ message: 'El ID de la orden es requerido' })
  @IsUUID('4', { message: 'El ID de la orden debe ser un UUID válido' })
  ordenId!: string;

  @IsOptional()
  @IsString({ message: 'El número de seguimiento debe ser un texto' })
  @MaxLength(255, {
    message: 'El número de seguimiento no puede exceder 255 caracteres',
  })
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  numeroSeguimiento?: string | null;

  @IsOptional()
  @IsString({ message: 'El transportista debe ser un texto' })
  @MaxLength(255, {
    message: 'El transportista no puede exceder 255 caracteres',
  })
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  transportista?: string | null;
}
