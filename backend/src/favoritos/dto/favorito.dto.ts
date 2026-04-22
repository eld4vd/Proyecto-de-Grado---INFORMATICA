import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateFavoritoDto {
  @IsUUID()
  @IsNotEmpty()
  productoId!: string;
}

export class FavoritoResponseDto {
  id!: string;
  productoId!: string;
  createdAt!: Date;
  producto?: {
    id: string;
    nombre: string;
    slug: string;
    precio: number;
    stock: number;
    activo: boolean;
    imagenes?: { url: string; esPrincipal: boolean }[];
    marca?: { nombre: string } | null;
  };
}
