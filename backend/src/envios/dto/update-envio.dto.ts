import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsEnum, MaxLength } from 'class-validator';
import { toTrimmedStringOrNull } from '../../common/utils/transforms.util';

export enum EstadoEnvioEnum {
  PENDIENTE = 'PENDIENTE',
  EN_CAMINO = 'EN_CAMINO',
  ENTREGADO = 'ENTREGADO',
}

export class UpdateEnvioDto {
  @IsOptional()
  @IsEnum(EstadoEnvioEnum, { message: 'Estado de envío inválido' })
  estado?: EstadoEnvioEnum;

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
