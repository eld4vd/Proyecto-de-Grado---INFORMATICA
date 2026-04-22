import { IsOptional, IsEnum, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { toTrimmedStringOrNull } from '../../common/utils/transforms.util';

export enum EstadoPagoEnum {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
  REEMBOLSADO = 'REEMBOLSADO',
}

export class UpdatePagoDto {
  @IsOptional()
  @IsEnum(EstadoPagoEnum, { message: 'Estado de pago inválido' })
  estado?: EstadoPagoEnum;

  @IsOptional()
  @IsString({ message: 'El ID de transacción debe ser un texto' })
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  transaccionId?: string | null;
}
