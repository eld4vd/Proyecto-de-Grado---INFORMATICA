import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsUUID,
  IsString,
  IsNumber,
  Min,
  IsOptional,
  MaxLength,
  IsEnum,
} from 'class-validator';
import {
  toTrimmedString,
  toTrimmedStringOrNull,
} from '../../common/utils/transforms.util';

export enum MetodoPagoEnum {
  TRANSFERENCIA = 'transferencia',
  TARJETA = 'tarjeta',
  QR = 'qr',
  EFECTIVO = 'efectivo',
}

export class CreatePagoDto {
  @IsNotEmpty({ message: 'El ID de la orden es requerido' })
  @IsUUID('4', { message: 'El ID de la orden debe ser un UUID válido' })
  ordenId!: string;

  @IsNotEmpty({ message: 'El monto es requerido' })
  @IsNumber({}, { message: 'El monto debe ser un número' })
  @Min(0.01, { message: 'El monto debe ser mayor a 0' })
  @Type(() => Number)
  monto!: number;

  @IsNotEmpty({ message: 'El método de pago es requerido' })
  @IsString({ message: 'El método de pago debe ser un texto' })
  @MaxLength(50, {
    message: 'El método de pago no puede exceder 50 caracteres',
  })
  @Transform(({ value }) => toTrimmedString(value).toLowerCase())
  metodoPago!: string;

  @IsOptional()
  @IsString({ message: 'El ID de transacción debe ser un texto' })
  @MaxLength(255, {
    message: 'El ID de transacción no puede exceder 255 caracteres',
  })
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  transaccionId?: string | null;
}
