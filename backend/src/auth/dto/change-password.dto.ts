import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

/**
 * DTO para cambiar contraseña
 */
export class ChangePasswordDto {
  @IsString({ message: 'La contraseña actual debe ser texto' })
  @IsNotEmpty({ message: 'La contraseña actual es requerida' })
  currentPassword!: string;

  @IsString({ message: 'La nueva contraseña debe ser texto' })
  @IsNotEmpty({ message: 'La nueva contraseña es requerida' })
  @MinLength(8, {
    message: 'La nueva contraseña debe tener al menos 8 caracteres',
  })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    {
      message:
        'La contraseña debe contener al menos: una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)',
    },
  )
  newPassword!: string;

  @IsString({ message: 'La confirmación debe ser texto' })
  @IsNotEmpty({ message: 'La confirmación de contraseña es requerida' })
  confirmPassword!: string;
}
