import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

// Configuración de Prisma 7 con adapter
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const SALT_ROUNDS = 12;

async function main() {
  console.log('🌱 Iniciando seed de datos...');

  // ==========================================
  // ADMIN INICIAL (Dashboard)
  // ==========================================
  const adminPassword = await bcrypt.hash('Admin123!', SALT_ROUNDS);
  
  const admin = await prisma.adminUsuario.upsert({
    where: { email: 'admin@techstore.com' },
    update: {},
    create: {
      email: 'admin@techstore.com',
      passwordHash: adminPassword,
      nombre: 'Administrador',
      activo: true,
    },
  });
  console.log(`✅ Admin creado: ${admin.email}`);
  console.log(`   📧 Email: admin@techstore.com`);
  console.log(`   🔑 Password: Admin123!`);

  // ==========================================
  // CLIENTE DE PRUEBA
  // ==========================================
  const clientePassword = await bcrypt.hash('Cliente123!', SALT_ROUNDS);
  
  const cliente = await prisma.cliente.upsert({
    where: { email: 'cliente@test.com' },
    update: {},
    create: {
      email: 'cliente@test.com',
      passwordHash: clientePassword,
      nombre: 'Juan',
      apellido: 'Pérez',
      telefono: '+591 70000000',
      nitCi: '12345678',
    },
  });
  console.log(`✅ Cliente de prueba creado: ${cliente.email}`);
  console.log(`   📧 Email: cliente@test.com`);
  console.log(`   🔑 Password: Cliente123!`);

  console.log('\n🎉 Seed completado exitosamente!');
  console.log('📦 Datos creados:');
  console.log('   👤 1 admin (admin@techstore.com / Admin123!)');
  console.log('   👥 1 cliente de prueba (cliente@test.com / Cliente123!)');
  console.log('\n💡 Seed minimo aplicado: solo usuarios base.');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
