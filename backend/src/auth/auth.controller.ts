import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Res,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import * as express from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterDto,
  AdminLoginDto,
  UpdateProfileDto,
  ChangePasswordDto,
} from './dto';
import { JwtAuthGuard } from './guards';
import { Public, CurrentUser } from './decorators';
import type { AuthenticatedUser } from './interfaces';

/**
 * Controlador de autenticación
 *
 * Endpoints:
 * - POST /api/auth/register       → Registro de clientes
 * - POST /api/auth/login          → Login de clientes
 * - POST /api/auth/admin/login    → Login de administradores
 * - POST /api/auth/refresh        → Renovar access token
 * - POST /api/auth/logout         → Cerrar sesión
 * - GET  /api/auth/profile        → Obtener perfil (requiere auth)
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ==========================================
  // REGISTRO (Público)
  // ==========================================

  /**
   * Registrar nuevo cliente
   * Rate limit: 5 intentos por minuto (protección anti-bots)
   */
  @Public()
  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 por minuto
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    return this.authService.register(registerDto, res);
  }

  // ==========================================
  // LOGIN (Público)
  // ==========================================

  /**
   * Login de cliente
   * Rate limit: 5 intentos por minuto (protección brute force)
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 por minuto
  async loginCliente(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    return this.authService.loginCliente(loginDto, res);
  }

  /**
   * Login de administrador
   * Rate limit: 3 intentos por minuto (más estricto)
   */
  @Public()
  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 por minuto
  async loginAdmin(
    @Body() loginDto: AdminLoginDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    return this.authService.loginAdmin(loginDto, res);
  }

  // ==========================================
  // REFRESH TOKEN (Público pero requiere cookie)
  // ==========================================

  /**
   * Renovar access token usando refresh token
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const refreshToken = req.cookies?.['refresh_token'];
    return this.authService.refreshToken(refreshToken, res);
  }

  // ==========================================
  // LOGOUT (Público)
  // ==========================================

  /**
   * Cerrar sesión - limpia las cookies
   */
  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: express.Response) {
    return this.authService.logout(res);
  }

  // ==========================================
  // PERFIL (Requiere autenticación)
  // ==========================================

  /**
   * Obtener perfil del usuario autenticado
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getProfile(user);
  }

  /**
   * Verificar si el usuario está autenticado
   * Útil para el frontend
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return {
      authenticated: true,
      user,
    };
  }

  // ==========================================
  // ACTUALIZACIÓN DE PERFIL (Requiere autenticación)
  // ==========================================

  /**
   * Actualizar perfil del usuario autenticado
   */
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user, updateProfileDto);
  }

  /**
   * Cambiar contraseña del usuario autenticado
   * Rate limit: 3 intentos por minuto (protección)
   */
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 por minuto
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user, changePasswordDto);
  }
}
