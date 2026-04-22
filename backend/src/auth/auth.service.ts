import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto';
import { JwtPayload, AuthenticatedUser } from './interfaces';
import { Role } from './enums';

const SALT_ROUNDS = 12; // Aumentado para mayor seguridad (2025 standard)

/**
 * Servicio de autenticación con JWT y cookies httpOnly
 *
 * Implementa patrón de doble token:
 * - Access Token: 15 minutos, para autenticación
 * - Refresh Token: 7 días, para renovar access token
 *
 * Mejores prácticas 2025/2026:
 * - Cookies httpOnly (protección XSS)
 * - SameSite=Lax (protección CSRF básica)
 * - Secure en producción
 * - Hash bcrypt con 12 rounds
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // Tiempos de expiración
  private readonly ACCESS_TOKEN_EXPIRY = '15m';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';

  // Tiempos en milisegundos para cookies
  private readonly ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000; // 15 minutos
  private readonly REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 días

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ==========================================
  // CLIENTES
  // ==========================================

  /**
   * Registro de nuevo cliente
   */
  async register(registerDto: RegisterDto, res: Response) {
    // Verificar email único
    const existingEmail = await this.prisma.cliente.findUnique({
      where: { email: registerDto.email },
    });

    if (existingEmail) {
      throw new ConflictException('Este email ya está registrado');
    }

    // Hash de contraseña
    const passwordHash = await bcrypt.hash(registerDto.password, SALT_ROUNDS);

    // Crear cliente
    const cliente = await this.prisma.cliente.create({
      data: {
        nombre: registerDto.nombre,
        apellido: registerDto.apellido,
        email: registerDto.email,
        passwordHash,
        telefono: registerDto.telefono,
        nitCi: registerDto.nitCi,
      },
    });

    this.logger.log(`Nuevo cliente registrado: ${cliente.email}`);

    // Generar tokens y setear cookies
    return this.generateTokensAndSetCookies(
      {
        id: cliente.id,
        email: cliente.email,
        role: Role.CLIENTE,
      },
      res,
    );
  }

  /**
   * Login de cliente
   */
  async loginCliente(loginDto: LoginDto, res: Response) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { email: loginDto.email },
    });

    // Usuario no existe o está eliminado
    if (!cliente || cliente.deletedAt) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(
      loginDto.password,
      cliente.passwordHash,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Actualizar último login
    await this.prisma.cliente.update({
      where: { id: cliente.id },
      data: { lastLoginAt: new Date() },
    });

    this.logger.log(`Cliente logueado: ${cliente.email}`);

    // Generar tokens y setear cookies
    return this.generateTokensAndSetCookies(
      {
        id: cliente.id,
        email: cliente.email,
        role: Role.CLIENTE,
      },
      res,
    );
  }

  // ==========================================
  // ADMINISTRADORES
  // ==========================================

  /**
   * Login de administrador
   */
  async loginAdmin(loginDto: LoginDto, res: Response) {
    const admin = await this.prisma.adminUsuario.findUnique({
      where: { email: loginDto.email },
    });

    // Usuario no existe, no está activo o está eliminado
    if (!admin || !admin.activo || admin.deletedAt) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(
      loginDto.password,
      admin.passwordHash,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Actualizar último login
    await this.prisma.adminUsuario.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    this.logger.log(`Admin logueado: ${admin.email}`);

    // Generar tokens y setear cookies
    return this.generateTokensAndSetCookies(
      {
        id: admin.id,
        email: admin.email,
        role: Role.ADMIN,
      },
      res,
    );
  }

  // ==========================================
  // REFRESH TOKEN
  // ==========================================

  /**
   * Renovar access token usando refresh token
   */
  async refreshToken(refreshToken: string, res: Response) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token no proporcionado');
    }

    try {
      // Verificar refresh token
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        { secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET') },
      );

      // Verificar que sea un refresh token
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Tipo de token inválido');
      }

      // Verificar que el usuario aún existe y está activo
      const user = await this.verifyUserExists(payload.sub, payload.role);

      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado o inactivo');
      }

      this.logger.log(`Token renovado para: ${payload.email}`);

      // Generar nuevos tokens
      return this.generateTokensAndSetCookies(
        {
          id: payload.sub,
          email: payload.email,
          role: payload.role,
        },
        res,
      );
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  // ==========================================
  // LOGOUT
  // ==========================================

  /**
   * Cerrar sesión - limpiar cookies
   */
  logout(res: Response) {
    this.clearAuthCookies(res);

    return {
      success: true,
      message: 'Sesión cerrada correctamente',
    };
  }

  // ==========================================
  // PERFIL
  // ==========================================

  /**
   * Obtener perfil del usuario autenticado
   */
  async getProfile(user: AuthenticatedUser) {
    if (user.role === Role.ADMIN) {
      const admin = await this.prisma.adminUsuario.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          nombre: true,
          activo: true,
          lastLoginAt: true,
          createdAt: true,
        },
      });

      if (!admin) {
        throw new UnauthorizedException('Administrador no encontrado');
      }

      return { ...admin, role: Role.ADMIN };
    }

    // Cliente
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        telefono: true,
        nitCi: true,
        lastLoginAt: true,
        createdAt: true,
        _count: {
          select: {
            ordenes: true,
            direcciones: true,
          },
        },
      },
    });

    if (!cliente) {
      throw new UnauthorizedException('Cliente no encontrado');
    }

    return { ...cliente, role: Role.CLIENTE };
  }

  // ==========================================
  // ACTUALIZACIÓN DE PERFIL
  // ==========================================

  /**
   * Actualizar perfil del usuario autenticado
   */
  async updateProfile(
    user: AuthenticatedUser,
    updateData: { nombre?: string; apellido?: string; telefono?: string },
  ) {
    if (user.role === Role.ADMIN) {
      const admin = await this.prisma.adminUsuario.update({
        where: { id: user.id },
        data: {
          nombre: updateData.nombre,
        },
        select: {
          id: true,
          email: true,
          nombre: true,
          activo: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      this.logger.log(`Perfil de admin actualizado: ${admin.email}`);

      return {
        success: true,
        message: 'Perfil actualizado correctamente',
        user: { ...admin, role: Role.ADMIN },
      };
    }

    // Cliente
    const cliente = await this.prisma.cliente.update({
      where: { id: user.id },
      data: {
        nombre: updateData.nombre,
        apellido: updateData.apellido,
        telefono: updateData.telefono,
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        telefono: true,
        nitCi: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log(`Perfil de cliente actualizado: ${cliente.email}`);

    return {
      success: true,
      message: 'Perfil actualizado correctamente',
      user: { ...cliente, role: Role.CLIENTE },
    };
  }

  // ==========================================
  // CAMBIO DE CONTRASEÑA
  // ==========================================

  /**
   * Cambiar contraseña del usuario autenticado
   */
  async changePassword(
    user: AuthenticatedUser,
    passwordData: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    },
  ) {
    // Validar que las contraseñas nuevas coincidan
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    // Validar que la nueva contraseña sea diferente a la actual
    if (passwordData.currentPassword === passwordData.newPassword) {
      throw new BadRequestException(
        'La nueva contraseña debe ser diferente a la actual',
      );
    }

    if (user.role === Role.ADMIN) {
      // Obtener admin con hash de contraseña
      const admin = await this.prisma.adminUsuario.findUnique({
        where: { id: user.id },
        select: { id: true, email: true, passwordHash: true },
      });

      if (!admin) {
        throw new UnauthorizedException('Administrador no encontrado');
      }

      // Verificar contraseña actual
      const isValidCurrentPassword = await bcrypt.compare(
        passwordData.currentPassword,
        admin.passwordHash,
      );

      if (!isValidCurrentPassword) {
        throw new BadRequestException('La contraseña actual es incorrecta');
      }

      // Generar nuevo hash
      const newPasswordHash = await bcrypt.hash(
        passwordData.newPassword,
        SALT_ROUNDS,
      );

      // Actualizar contraseña
      await this.prisma.adminUsuario.update({
        where: { id: user.id },
        data: {
          passwordHash: newPasswordHash,
        },
      });

      this.logger.log(`Contraseña de admin cambiada: ${admin.email}`);

      return {
        success: true,
        message: 'Contraseña cambiada correctamente',
      };
    }

    // Cliente
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, passwordHash: true },
    });

    if (!cliente) {
      throw new UnauthorizedException('Cliente no encontrado');
    }

    // Verificar contraseña actual
    const isValidCurrentPassword = await bcrypt.compare(
      passwordData.currentPassword,
      cliente.passwordHash,
    );

    if (!isValidCurrentPassword) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    // Generar nuevo hash
    const newPasswordHash = await bcrypt.hash(
      passwordData.newPassword,
      SALT_ROUNDS,
    );

    // Actualizar contraseña
    await this.prisma.cliente.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    this.logger.log(`Contraseña de cliente cambiada: ${cliente.email}`);

    return {
      success: true,
      message: 'Contraseña cambiada correctamente',
    };
  }

  // ==========================================
  // HELPERS PRIVADOS
  // ==========================================

  /**
   * Genera access y refresh tokens, y setea cookies httpOnly
   */
  private async generateTokensAndSetCookies(
    user: AuthenticatedUser,
    res: Response,
  ) {
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    // Configurar cookies seguras
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    // Access Token Cookie (15 min)
    res.cookie('access_token', accessToken, {
      httpOnly: true, // No accesible desde JavaScript
      secure: isProduction, // Solo HTTPS en producción
      sameSite: 'lax', // Protección CSRF básica
      maxAge: this.ACCESS_COOKIE_MAX_AGE,
      path: '/',
    });

    // Refresh Token Cookie (7 días)
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: this.REFRESH_COOKIE_MAX_AGE,
      path: '/',
    });

    return {
      success: true,
      message: 'Autenticación exitosa',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      // También retornar tokens en body para APIs móviles/testing
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: this.ACCESS_COOKIE_MAX_AGE / 1000, // En segundos
      },
    };
  }

  /**
   * Genera Access Token (15 min)
   */
  private async generateAccessToken(user: AuthenticatedUser): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });
  }

  /**
   * Genera Refresh Token (7 días)
   */
  private async generateRefreshToken(user: AuthenticatedUser): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'refresh',
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
    });
  }

  /**
   * Limpia las cookies de autenticación
   */
  private clearAuthCookies(res: Response) {
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 0, // Expirar inmediatamente
    };

    // Usar cookie con valor vacío y maxAge: 0 para eliminar
    res.cookie('access_token', '', cookieOptions);
    res.cookie('refresh_token', '', cookieOptions);

    // También intentar clearCookie como backup
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
  }

  /**
   * Verifica que el usuario exista y esté activo
   */
  private async verifyUserExists(userId: string, role: Role): Promise<boolean> {
    if (role === Role.ADMIN) {
      const admin = await this.prisma.adminUsuario.findUnique({
        where: { id: userId },
        select: { id: true, activo: true, deletedAt: true },
      });
      return !!admin && admin.activo && !admin.deletedAt;
    }

    const cliente = await this.prisma.cliente.findUnique({
      where: { id: userId },
      select: { id: true, deletedAt: true },
    });
    return !!cliente && !cliente.deletedAt;
  }
}
