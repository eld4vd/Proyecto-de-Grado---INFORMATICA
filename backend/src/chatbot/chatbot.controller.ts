import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { Public } from '../auth/decorators';
import { Throttle } from '@nestjs/throttler';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * DTO de entrada con validación estricta.
 * - @IsString: solo acepta strings
 * - @IsNotEmpty: rechaza strings vacíos
 * - @MaxLength(500): limita longitud máxima (defensa en profundidad con sanitizarMensaje)
 */
class ChatDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  mensaje!: string;
}

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  /**
   * POST /api/chatbot/ask
   * 
   * Seguridad:
   * - @Public() → no requiere JWT (es chatbot público)
   * - @Throttle() → máximo 8 requests por minuto por IP
   * - ValidationPipe global → valida DTO (IsString, IsNotEmpty, MaxLength)
   * - Mensaje sanitizado en el service (CAPA 1)
   */
  @Public()
  @Throttle({ default: { ttl: 60000, limit: 8 } })
  @Post('ask')
  @HttpCode(HttpStatus.OK)
  async ask(@Body() chatDto: ChatDto) {
    if (!chatDto.mensaje || chatDto.mensaje.trim().length === 0) {
      return {
        respuesta: 'Por favor, escribe tu consulta para poder ayudarte.',
        productosRecomendados: [],
        timestamp: new Date().toISOString(),
      };
    }

    return this.chatbotService.chat(chatDto.mensaje.trim());
  }
}
