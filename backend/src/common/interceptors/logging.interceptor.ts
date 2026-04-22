import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse<Response>();
          this.logger.log(
            `${method} ${url} ${response.statusCode} - ${Date.now() - now}ms`,
          );
        },
        error: (error) => {
          const status = error?.status || 500;
          this.logger.warn(
            `${method} ${url} ${status} - ${Date.now() - now}ms`,
          );
        },
      }),
    );
  }
}
