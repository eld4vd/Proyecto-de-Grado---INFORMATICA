import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { toTrimmedStringOrNull } from '../../common/utils/transforms.util';

export enum EstadoOrdenEnum {
  PENDIENTE = 'PENDIENTE',
  PAGADO = 'PAGADO',
  ENVIADO = 'ENVIADO',
  ENTREGADO = 'ENTREGADO',
  CANCELADO = 'CANCELADO',
}

export enum EstadoPagoEnum {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
  REEMBOLSADO = 'REEMBOLSADO',
}

export class UpdateOrdenDto {
  @IsOptional()
  @IsEnum(EstadoOrdenEnum, { message: 'Estado de orden inválido' })
  estado?: EstadoOrdenEnum;

  @IsOptional()
  @IsEnum(EstadoPagoEnum, { message: 'Estado de pago inválido' })
  estadoPago?: EstadoPagoEnum;

  @IsOptional()
  @IsString({ message: 'Las notas deben ser un texto' })
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  notas?: string | null;
}
