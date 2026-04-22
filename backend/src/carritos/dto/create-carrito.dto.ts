import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateCarritoDto {
  @IsNotEmpty({ message: 'El ID del cliente es requerido' })
  @IsUUID('4', { message: 'El ID del cliente debe ser un UUID válido' })
  clienteId!: string;
}

