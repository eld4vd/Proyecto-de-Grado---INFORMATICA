import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO para login de clientes
 */
export class LoginDto {
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email!: string;

  @IsString({ message: 'La contraseña debe ser texto' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;
}

/**
 * DTO para login de administradores
 */
export class AdminLoginDto extends LoginDto {}
