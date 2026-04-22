import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log:
        process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Método helper para excluir campos de un objeto
   * Útil para no devolver passwordHash, deletedAt, etc.
   */
  excludeFields<T extends Record<string, unknown>, Key extends keyof T>(
    entity: T,
    keys: Key[],
  ): Omit<T, Key> {
    const result = { ...entity };
    for (const key of keys) {
      delete result[key];
    }
    return result as Omit<T, Key>;
  }

  /**
   * Método para soft delete (actualiza deletedAt)
   */
  async softDelete<T>(
    model: {
      update: (args: {
        where: { id: string };
        data: { deletedAt: Date };
      }) => Promise<T>;
    },
    id: string,
  ): Promise<T> {
    return model.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
