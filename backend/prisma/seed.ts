// MOVIA — Seed de datos simulados
// - 3 usuarios: 1 ADMIN + 2 ASESOR (contraseña: demo123)
// - 44 vehículos (16 AUTO / 22 SUV / 6 CAMIONETA, NUEVO / USADO)
// - 3 fotos por vehículo (catálogo de URLs de Pexels por bodyType, con rotación)
// - 15 consultas (mix de generales y sobre vehículos, varios estados)
//
// Re-ejecutable: al iniciar borra fotos, consultas y vehículos (los usuarios
// usan upsert). Ojo: también elimina vehículos creados a mano desde el panel.
// Fuente y verificación de URLs: docs/bitacora/seed-fotos-por-categoria.md

import { PrismaClient, VehicleStatus, InquiryStatus } from "@prisma/client";
import { hash } from "argon2";

const prisma = new PrismaClient();

// URLs verificadas (HTTP 200, image/jpeg) — licencia Pexels, uso libre.
const PEXELS_CDN = "https://images.pexels.com/photos/{id}/pexels-photo-{id}.jpeg?auto=compress&cs=tinysrgb&w=1200&h=675&fit=crop";
const pexels = (id: number) => PEXELS_CDN.replaceAll("{id}", String(id));

// Pool de 6 por categoría; cada vehículo recibe 3 fotos consecutivas rotando
// por su índice (6 sets distintos en el catálogo, sin sets idénticos seguidos).
const vehicleImages: Record<"AUTO" | "SUV" | "CAMIONETA", string[]> = {
  AUTO: [34445488, 11305497, 9827716, 12170284, 12170317, 29593175].map(pexels),
  SUV: [14776590, 17264100, 30479247, 14038635, 5608576, 4120664].map(pexels),
  CAMIONETA: [25851807, 9331954, 32513625, 5661743, 21858643, 13804269].map(pexels),
};

async function main() {
  const passwordHash = await hash("demo123");

  // --- Usuarios ---
  const [admin, asesorA, asesorB] = await Promise.all([
    prisma.user.upsert({
      where: { email: "maria@movia.demo" },
      update: {},
      create: { name: "María López", email: "maria@movia.demo", role: "ADMIN", isActive: true, passwordHash },
    }),
    prisma.user.upsert({
      where: { email: "carlos@movia.demo" },
      update: {},
      create: { name: "Carlos Ruiz", email: "carlos@movia.demo", role: "ASESOR", isActive: true, passwordHash },
    }),
    prisma.user.upsert({
      where: { email: "ana@movia.demo" },
      update: {},
      create: { name: "Ana Torres", email: "ana@movia.demo", role: "ASESOR", isActive: true, passwordHash },
    }),
  ]);

  // --- Limpieza previa (seed re-ejecutable, respetando FKs) ---
  await prisma.photo.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.vehicle.deleteMany();

  // --- Vehículos ---
  const vehicleData = [
    { make: "Toyota", model: "Corolla", year: 2024, price: 98500000, mileage: 0, condition: "NUEVO", bodyType: "AUTO", fuel: "Gasolina", transmission: "Automática", color: "Blanco", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
    { make: "Toyota", model: "Corolla", year: 2023, price: 87900000, mileage: 12400, condition: "USADO", bodyType: "AUTO", fuel: "Gasolina", transmission: "Automática", color: "Gris grafito", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
    { make: "Mazda", model: "3", year: 2024, price: 105000000, mileage: 0, condition: "NUEVO", bodyType: "AUTO", fuel: "Gasolina", transmission: "Automática", color: "Rojo Soul Red", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
    { make: "Mazda", model: "3", year: 2022, price: 72500000, mileage: 34200, condition: "USADO", bodyType: "AUTO", fuel: "Gasolina", transmission: "Manual", color: "Negro", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
    { make: "Hyundai", model: "Tucson", year: 2024, price: 118000000, mileage: 0, condition: "NUEVO", bodyType: "SUV", fuel: "Gasolina", transmission: "Automática", color: "Azul", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
    { make: "Hyundai", model: "Tucson", year: 2023, price: 105000000, mileage: 8900, condition: "USADO", bodyType: "SUV", fuel: "Gasolina", transmission: "Automática", color: "Blanco", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
    { make: "Kia", model: "Sportage", year: 2024, price: 112000000, mileage: 0, condition: "NUEVO", bodyType: "SUV", fuel: "Gasolina", transmission: "Automática", color: "Verde oliva", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
    { make: "Chevrolet", model: "Spark", year: 2024, price: 45000000, mileage: 0, condition: "NUEVO", bodyType: "AUTO", fuel: "Gasolina", transmission: "Manual", color: "Rojo", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
    { make: "Chevrolet", model: "Onix", year: 2023, price: 52000000, mileage: 15600, condition: "USADO", bodyType: "AUTO", fuel: "Gasolina", transmission: "Automática", color: "Plata", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
    { make: "Renault", model: "Duster", year: 2024, price: 89000000, mileage: 0, condition: "NUEVO", bodyType: "SUV", fuel: "Gasolina", transmission: "Manual", color: "Naranja", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
    { make: "Nissan", model: "Frontier", year: 2024, price: 145000000, mileage: 0, condition: "NUEVO", bodyType: "CAMIONETA", fuel: "Diésel", transmission: "Automática", color: "Negro", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
    { make: "Ford", model: "Ranger", year: 2023, price: 138000000, mileage: 22000, condition: "USADO", bodyType: "CAMIONETA", fuel: "Diésel", transmission: "Automática", color: "Azul", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
    { make: "Volkswagen", model: "Polo", year: 2024, price: 68000000, mileage: 0, condition: "NUEVO", bodyType: "AUTO", fuel: "Gasolina", transmission: "Automática", color: "Blanco", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
    { make: "Peugeot", model: "208", year: 2024, price: 72000000, mileage: 0, condition: "NUEVO", bodyType: "AUTO", fuel: "Gasolina", transmission: "Automática", color: "Gris", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
    { make: "Toyota", model: "Hilux", year: 2024, price: 165000000, mileage: 0, condition: "NUEVO", bodyType: "CAMIONETA", fuel: "Diésel", transmission: "Automática", color: "Blanco", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
    { make: "Toyota", model: "Hilux", year: 2022, price: 139000000, mileage: 45000, condition: "USADO", bodyType: "CAMIONETA", fuel: "Diésel", transmission: "Automática", color: "Gris", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
    { make: "Honda", model: "CR-V", year: 2024, price: 142000000, mileage: 0, condition: "NUEVO", bodyType: "SUV", fuel: "Gasolina", transmission: "Automática", color: "Negro", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
    { make: "Honda", model: "Civic", year: 2023, price: 108000000, mileage: 18000, condition: "USADO", bodyType: "AUTO", fuel: "Gasolina", transmission: "Automática", color: "Rojo", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
    { make: "Suzuki", model: "Vitara", year: 2023, price: 88000000, mileage: 22000, condition: "USADO", bodyType: "SUV", fuel: "Gasolina", transmission: "Automática", color: "Blanco", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
    { make: "Suzuki", model: "S-Cross", year: 2024, price: 95000000, mileage: 0, condition: "NUEVO", bodyType: "SUV", fuel: "Híbrido", transmission: "Automática", color: "Azul", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
    { make: "Fiat", model: "Pulse", year: 2024, price: 62000000, mileage: 0, condition: "NUEVO", bodyType: "SUV", fuel: "Gasolina", transmission: "Automática", color: "Gris", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
    { make: "Jeep", model: "Compass", year: 2024, price: 135000000, mileage: 0, condition: "NUEVO", bodyType: "SUV", fuel: "Gasolina", transmission: "Automática", color: "Verde militar", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
    { make: "Jeep", model: "Gladiator", year: 2023, price: 178000000, mileage: 11000, condition: "USADO", bodyType: "CAMIONETA", fuel: "Gasolina", transmission: "Automática", color: "Negro", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
    { make: "BMW", model: "Serie 3", year: 2024, price: 235000000, mileage: 0, condition: "NUEVO", bodyType: "AUTO", fuel: "Gasolina", transmission: "Automática", color: "Blanco", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
    { make: "Mercedes-Benz", model: "Clase A", year: 2024, price: 198000000, mileage: 0, condition: "NUEVO", bodyType: "AUTO", fuel: "Gasolina", transmission: "Automática", color: "Negro", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
    { make: "Audi", model: "A3", year: 2024, price: 185000000, mileage: 0, condition: "NUEVO", bodyType: "AUTO", fuel: "Gasolina", transmission: "Automática", color: "Gris", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
    { make: "Volvo", model: "XC40", year: 2024, price: 175000000, mileage: 0, condition: "NUEVO", bodyType: "SUV", fuel: "Híbrido", transmission: "Automática", color: "Azul", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
    { make: "Mitsubishi", model: "Outlander", year: 2024, price: 128000000, mileage: 0, condition: "NUEVO", bodyType: "SUV", fuel: "Gasolina", transmission: "Automática", color: "Blanco", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
    { make: "Subaru", model: "Outback", year: 2023, price: 142000000, mileage: 9800, condition: "USADO", bodyType: "SUV", fuel: "Gasolina", transmission: "Automática", color: "Rojo", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
    { make: "Lexus", model: "NX", year: 2024, price: 195000000, mileage: 0, condition: "NUEVO", bodyType: "SUV", fuel: "Híbrido", transmission: "Automática", color: "Negro", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
    { make: "Kia", model: "Picanto", year: 2022, price: 48000000, mileage: 28000, condition: "USADO", bodyType: "AUTO", fuel: "Gasolina", transmission: "Automática", color: "Blanco", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
    { make: "Renault", model: "Logan", year: 2021, price: 42000000, mileage: 41000, condition: "USADO", bodyType: "AUTO", fuel: "Gasolina", transmission: "Manual", color: "Gris", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
    { make: "Hyundai", model: "i10", year: 2022, price: 38000000, mileage: 32000, condition: "USADO", bodyType: "AUTO", fuel: "Gasolina", transmission: "Manual", color: "Rojo", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
    { make: "Chevrolet", model: "Tracker", year: 2023, price: 78000000, mileage: 15000, condition: "USADO", bodyType: "SUV", fuel: "Gasolina", transmission: "Automática", color: "Negro", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
    { make: "Ford", model: "Escape", year: 2022, price: 95000000, mileage: 29000, condition: "USADO", bodyType: "SUV", fuel: "Gasolina", transmission: "Automática", color: "Azul", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
    { make: "Volkswagen", model: "T-Cross", year: 2023, price: 88000000, mileage: 18000, condition: "USADO", bodyType: "SUV", fuel: "Gasolina", transmission: "Automática", color: "Blanco", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
    { make: "Toyota", model: "Yaris", year: 2021, price: 55000000, mileage: 48000, condition: "USADO", bodyType: "AUTO", fuel: "Gasolina", transmission: "CVT", color: "Plata", status: VehicleStatus.ARCHIVADO, createdBy: admin.id },
    { make: "Mazda", model: "CX-5", year: 2020, price: 82000000, mileage: 56000, condition: "USADO", bodyType: "SUV", fuel: "Gasolina", transmission: "Automática", color: "Rojo", status: VehicleStatus.ARCHIVADO, createdBy: admin.id },
    { make: "Nissan", model: "X-Trail", year: 2022, price: 105000000, mileage: 35000, condition: "USADO", bodyType: "SUV", fuel: "Gasolina", transmission: "Automática", color: "Blanco", status: VehicleStatus.BORRADOR, createdBy: admin.id },
    { make: "Jeep", model: "Wrangler", year: 2021, price: 165000000, mileage: 42000, condition: "USADO", bodyType: "CAMIONETA", fuel: "Gasolina", transmission: "Automática", color: "Verde", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
    { make: "Land Rover", model: "Range Rover Evoque", year: 2023, price: 285000000, mileage: 12000, condition: "USADO", bodyType: "SUV", fuel: "Diésel", transmission: "Automática", color: "Negro", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
    { make: "Porsche", model: "Macan", year: 2024, price: 420000000, mileage: 0, condition: "NUEVO", bodyType: "SUV", fuel: "Gasolina", transmission: "Automática", color: "Blanco", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
    { make: "Acura", model: "MDX", year: 2024, price: 295000000, mileage: 0, condition: "NUEVO", bodyType: "SUV", fuel: "Gasolina", transmission: "Automática", color: "Gris", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
    { make: "Cadillac", model: "XT5", year: 2023, price: 245000000, mileage: 8500, condition: "USADO", bodyType: "SUV", fuel: "Gasolina", transmission: "Automática", color: "Negro", status: VehicleStatus.PUBLICADO, createdBy: admin.id },
  ];

  const vehicles = await Promise.all(
    vehicleData.map((v) =>
      prisma.vehicle.create({ data: { ...v, status: v.status as VehicleStatus } })
    )
  );
  console.log(`Vehículos creados: ${vehicles.length}`);

  // --- Fotos (3 por vehículo, del pool de su bodyType, rotando por índice) ---
  const photos = vehicles.flatMap((vehicle, index) => {
    const images = vehicleImages[vehicle.bodyType as "AUTO" | "SUV" | "CAMIONETA"];
    return [1, 2, 3].map((order, k) => ({
      url: images[(index + k) % images.length]!,
      order,
      vehicleId: vehicle.id,
    }));
  });

  const { count: photosCreated } = await prisma.photo.createMany({ data: photos });
  console.log(`Fotos creadas: ${photosCreated}`);

  // --- Consultas (15, mix de generales y sobre vehículos) ---
  const inquiryData = [
    { name: "Julián Ramírez", email: "julian.r@mail.com", phone: "310-555-0101", message: "¿El Toyota Corolla 2024 tiene disponible en agencia?", vehicleId: vehicles[0]!.id, status: InquiryStatus.NUEVA, notes: "Cliente interesado en versión tope de gama.", assignedToId: asesorA.id },
    { name: "Valentina Castro", email: "valca@mail.com", phone: "320-555-0202", message: "Quisiera saber si aceptan crédito para el Mazda 3.", vehicleId: vehicles[2]!.id, status: InquiryStatus.EN_CONTACTO, notes: "Llamada realizada, envió documentos.", assignedToId: asesorA.id },
    { name: "Andrés Morales", email: "andres.m@mail.com", phone: "315-555-0303", message: "Consulta general sobre garantías y financiamiento.", vehicleId: null, status: InquiryStatus.NUEVA, notes: null, assignedToId: asesorB.id },
    { name: "Camila Sánchez", email: "camila.s@mail.com", phone: "318-555-0404", message: "¿El Hyundai Tucson 2023 tiene disponibilidad inmediata?", vehicleId: vehicles[5]!.id, status: InquiryStatus.VENDIDA, notes: "Venta cerrada. Entrega programada para diciembre.", assignedToId: asesorA.id },
    { name: "Diego Herrera", email: "diego.h@mail.com", phone: "316-555-0505", message: "Interesado en la Nissan Frontier diésel.", vehicleId: vehicles[10]!.id, status: InquiryStatus.EN_SEGUIMIENTO, notes: "Cotización enviada.", assignedToId: asesorB.id },
    { name: "Laura Mejía", email: "laura.m@mail.com", phone: "300-555-0606", message: "Busco SUV compacto usado por menos de 80 millones.", vehicleId: null, status: InquiryStatus.NUEVA, notes: null, assignedToId: null },
    { name: "Mateo García", email: "mateog@mail.com", phone: "311-555-0707", message: "¿Tienen el Fiat Pulse en color blanco? ¿Precios y promociones?", vehicleId: vehicles[20]!.id, status: InquiryStatus.DESCARTADA, notes: "Cliente no respondió tras 3 intentos.", assignedToId: asesorA.id },
    { name: "Isabella López", email: "isa.l@mail.com", phone: "321-555-0808", message: "Información sobre la Jeep Wrangler 2021.", vehicleId: vehicles[39]!.id, status: InquiryStatus.EN_CONTACTO, notes: "Agendado visita para sábado.", assignedToId: asesorB.id },
    { name: "Santiago Ríos", email: "santi.r@mail.com", phone: "313-555-0909", message: "¿El Ford Ranger 2023 es doble cabina? Quiero verla en persona.", vehicleId: vehicles[11]!.id, status: InquiryStatus.EN_SEGUIMIENTO, notes: "Prueba de manejo agendada.", assignedToId: asesorA.id },
    { name: "Luciana Pérez", email: "lu.perez@mail.com", phone: "317-555-1010", message: "Gracias por la atención, finalmente decidí no comprar.", vehicleId: null, status: InquiryStatus.DESCARTADA, notes: null, assignedToId: null },
    { name: "Tomás Vargas", email: "tomas.v@mail.com", phone: "314-555-1111", message: "Consulto por el VW T-Cross usado.", vehicleId: vehicles[38]!.id, status: InquiryStatus.NUEVA, notes: null, assignedToId: null },
    { name: "Sofía Mendoza", email: "sofi.m@mail.com", phone: "312-555-1212", message: "Busco camioneta 4x4 para trabajo rural.", vehicleId: null, status: InquiryStatus.EN_CONTACTO, notes: "Remitir folletos de Ford Ranger y Toyota Hilux.", assignedToId: asesorB.id },
    { name: "Nicolás Ortega", email: "nico.o@mail.com", phone: "319-555-1313", message: "¿Aceptan mi auto como parte de pago?", vehicleId: vehicles[0]!.id, status: InquiryStatus.NUEVA, notes: null, assignedToId: null },
    { name: "Daniela Suárez", email: "dani.s@mail.com", phone: "310-555-1414", message: "Me interesa el BMW Serie 3 pero quisiera negociar precio.", vehicleId: vehicles[23]!.id, status: InquiryStatus.VENDIDA, notes: "Precio cerrado. Contrato firmado.", assignedToId: asesorA.id },
    { name: "Felipe Medina", email: "fe.medina@mail.com", phone: "322-555-1515", message: "Quisiera cambiar mi auto por uno usado; ¿qué opciones tienen?", vehicleId: null, status: InquiryStatus.NUEVA, notes: null, assignedToId: null },
  ];

  await Promise.all(
    inquiryData.map((inq) =>
      prisma.inquiry.create({ data: inq })
    )
  );
  console.log(`Consultas creadas: ${inquiryData.length}`);

  console.log("\n✅ Seed completado:");
  console.log(`   ${vehicles.length} vehículos`);
  console.log(`   ${photosCreated} fotos`);
  console.log(`   ${inquiryData.length} consultas`);
  console.log("   Credenciales demo: usuario: maria|carlos|ana@movia.demo | contraseña: demo123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });