// Seed de la base de datos con datos demo para Dripcake
// Ejecutar: npm run db:seed

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de Dripcake...');

  // Limpiar datos previos (orden importa por las FK)
  await prisma.itemPedido.deleteMany();
  await prisma.pedido.deleteMany();
  await prisma.diaNoLaborable.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.configuracionSistema.deleteMany();

  // ─── Usuarios ────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('admin123', 10);
  const empleadoHash = await bcrypt.hash('empleado123', 10);
  const clienteHash = await bcrypt.hash('cliente123', 10);

  const admin = await prisma.usuario.create({
    data: {
      nombre: 'Diego Garibaldo',
      telefono: '+507 6000-0001',
      email: 'admin@dripcake.com',
      passwordHash,
      rol: 'admin',
      activo: true,
    },
  });

  const empleado = await prisma.usuario.create({
    data: {
      nombre: 'María Pérez',
      telefono: '+507 6000-0002',
      email: 'empleado@dripcake.com',
      passwordHash: empleadoHash,
      rol: 'empleado',
      activo: true,
    },
  });

  const cliente1 = await prisma.usuario.create({
    data: {
      nombre: 'Ana Rodríguez',
      telefono: '+507 6000-0010',
      email: 'cliente@dripcake.com',
      passwordHash: clienteHash,
      rol: 'cliente',
      activo: true,
    },
  });

  const cliente2 = await prisma.usuario.create({
    data: {
      nombre: 'Carlos Méndez',
      telefono: '+507 6000-0011',
      email: 'carlos@dripcake.com',
      passwordHash: clienteHash,
      rol: 'cliente',
      activo: true,
    },
  });

  console.log('✓ Usuarios creados: 1 admin, 1 empleado, 2 clientes');

  // ─── Productos ───────────────────────────────────────────────────────────
  const pan = await prisma.producto.create({
    data: {
      nombre: 'Pan de Masa Madre (Bola)',
      descripcion: 'Pan artesanal de masa madre fermentada 24h. Corteza crujiente y miga esponjosa.',
      precio: 3.5,
      unidadVenta: 'unidad',
      cantidadMin: 1,
      cantidadMax: 20,
      stockSemanal: 50,
      activo: true,
    },
  });

  const baguette = await prisma.producto.create({
    data: {
      nombre: 'Baguette',
      descripcion: 'Baguette clásica francesa, corteza dorada y crujiente.',
      precio: 2.25,
      unidadVenta: 'unidad',
      cantidadMin: 1,
      cantidadMax: 15,
      stockSemanal: 40,
      activo: true,
    },
  });

  const paqueteBaguettes = await prisma.producto.create({
    data: {
      nombre: 'Paquete de Baguettes (12 unidades)',
      descripcion: 'Pack de 12 baguettes para familias o eventos.',
      precio: 24.0,
      unidadVenta: 'paquete de 12',
      cantidadMin: 1,
      cantidadMax: 3,
      stockSemanal: 10,
      activo: true,
    },
  });

  const integral = await prisma.producto.create({
    data: {
      nombre: 'Pan Integral con Semillas',
      descripcion: 'Pan integral con semillas de girasol, linaza y avena.',
      precio: 4.5,
      unidadVenta: 'unidad',
      cantidadMin: 1,
      cantidadMax: 10,
      stockSemanal: 25,
      activo: true,
    },
  });

  const focaccia = await prisma.producto.create({
    data: {
      nombre: 'Focaccia de Romero',
      descripcion: 'Focaccia italiana con romero fresco y aceite de oliva extra virgen.',
      precio: 6.0,
      unidadVenta: 'unidad',
      cantidadMin: 1,
      cantidadMax: 5,
      stockSemanal: 12,
      activo: true,
    },
  });

  console.log('✓ Productos creados: 5');

  // ─── Días no laborables ──────────────────────────────────────────────────
  // Crear algunos días no laborables de ejemplo para el año actual y próximo
  const anioActual = new Date().getFullYear();
  await prisma.diaNoLaborable.createMany({
    data: [
      {
        fecha: new Date(`${anioActual}-01-01T00:00:00`),
        tipo: 'feriado',
        descripcion: 'Año Nuevo',
        recurrente: true,
      },
      {
        fecha: new Date(`${anioActual}-11-03T00:00:00`),
        tipo: 'feriado',
        descripcion: 'Día de la Independencia (Panamá)',
        recurrente: true,
      },
      {
        fecha: new Date(`${anioActual}-12-25T00:00:00`),
        tipo: 'feriado',
        descripcion: 'Navidad',
        recurrente: true,
      },
    ],
  });

  console.log('✓ Días no laborables creados: 3');

  // ─── Configuración del sistema (singleton) ───────────────────────────────
  await prisma.configuracionSistema.create({
    data: {
      id: 1,
      whatsappContacto: '+50760000000',
    },
  });

  console.log('✓ Configuración del sistema inicializada');

  // ─── Resumen ─────────────────────────────────────────────────────────────
  console.log('\n🎉 Seed completado.\n');
  console.log('Credenciales de acceso:');
  console.log('  Admin:    admin@dripcake.com    / admin123');
  console.log('  Empleado: empleado@dripcake.com / empleado123');
  console.log('  Cliente:  cliente@dripcake.com  / cliente123');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
