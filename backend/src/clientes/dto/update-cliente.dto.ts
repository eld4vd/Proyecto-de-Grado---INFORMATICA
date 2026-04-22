import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateClienteDto } from './create-cliente.dto';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateClienteDto extends PartialType(
  OmitType(CreateClienteDto, ['password', 'email'] as const),
) {
  @IsOptional()
  @IsString({ message: 'La nueva contraseña debe ser un texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  newPassword?: string;
}
