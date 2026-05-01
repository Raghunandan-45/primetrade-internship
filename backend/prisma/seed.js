/**
 * Seed pre-baked users, an admin, vehicles, and a couple of service requests
 * so reviewers can log in instantly without registering.
 *
 * Run with:  node prisma/seed.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const USERS = [
  {
    name: 'Admin Boss',
    email: 'admin@vsms.dev',
    password: 'Admin@123',
    role: 'ADMIN',
    phone: '9000000000',
    address: 'Service Center HQ, Chennai',
  },
  {
    name: 'Alice Kumar',
    email: 'alice@vsms.dev',
    password: 'User@123',
    role: 'USER',
    phone: '9876543210',
    address: '12 MG Road, Bangalore',
  },
  {
    name: 'Bob Iyer',
    email: 'bob@vsms.dev',
    password: 'User@123',
    role: 'USER',
    phone: '9123456780',
    address: '45 Anna Salai, Chennai',
  },
  {
    name: 'Charlie Reddy',
    email: 'charlie@vsms.dev',
    password: 'User@123',
    role: 'USER',
    phone: '9988776655',
    address: '78 Banjara Hills, Hyderabad',
  },
];

const VEHICLES_BY_EMAIL = {
  'alice@vsms.dev': [
    { model: 'Toyota Innova', year: 2021, licensePlate: 'KA 05 MJ 1234', vin: '1HGBH41JXMN109186' },
    { model: 'Honda City',    year: 2019, licensePlate: 'KA 03 AB 5678', vin: 'JH4KA9650MC012345' },
  ],
  'bob@vsms.dev': [
    { model: 'Hyundai Creta', year: 2022, licensePlate: 'TN 20 BC 3424', vin: '5YJ3E1EA7KF317000' },
  ],
  'charlie@vsms.dev': [
    { model: 'Mahindra XUV700', year: 2023, licensePlate: 'TS 09 EZ 9999', vin: 'WBA5A5C50FD523000' },
  ],
};

async function main() {
  console.log('Seeding database...');

  const userMap = {};
  for (const u of USERS) {
    const hashed = await bcrypt.hash(u.password, 10);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, phone: u.phone, address: u.address, password: hashed },
      create: { ...u, password: hashed },
    });
    userMap[u.email] = user;
    console.log(`  user  ✓ ${u.role.padEnd(5)} ${u.email}  (password: ${u.password})`);
  }

  for (const [email, vehicles] of Object.entries(VEHICLES_BY_EMAIL)) {
    const owner = userMap[email];
    for (const v of vehicles) {
      const existing = await prisma.vehicle.findUnique({ where: { vin: v.vin } });
      if (existing) {
        console.log(`  vehicle = exists ${v.licensePlate}`);
        continue;
      }
      await prisma.vehicle.create({ data: { ...v, userId: owner.id } });
      console.log(`  vehicle ✓ ${v.licensePlate} → ${email}`);
    }
  }

  // a couple of demo service requests so the dashboard isn't empty
  const aliceVehicles = await prisma.vehicle.findMany({ where: { userId: userMap['alice@vsms.dev'].id } });
  const bobVehicles   = await prisma.vehicle.findMany({ where: { userId: userMap['bob@vsms.dev'].id } });

  const demoRequests = [
    {
      vehicleId: aliceVehicles[0]?.id,
      issueDescription: 'Engine oil change due',
      serviceType: 'OIL',
      status: 'PENDING',
      scheduledDate: new Date(Date.now() + 2 * 86400000),
      createdById: userMap['alice@vsms.dev'].id,
    },
    {
      vehicleId: aliceVehicles[1]?.id,
      issueDescription: 'Brake pads making noise',
      serviceType: 'BRAKE',
      status: 'IN_PROGRESS',
      scheduledDate: new Date(Date.now() + 1 * 86400000),
      createdById: userMap['alice@vsms.dev'].id,
    },
    {
      vehicleId: bobVehicles[0]?.id,
      issueDescription: 'Annual inspection',
      serviceType: 'INSPECTION',
      status: 'COMPLETED',
      scheduledDate: new Date(Date.now() - 3 * 86400000),
      createdById: userMap['bob@vsms.dev'].id,
    },
  ].filter((r) => r.vehicleId);

  for (const r of demoRequests) {
    const exists = await prisma.serviceRequest.findFirst({
      where: { vehicleId: r.vehicleId, issueDescription: r.issueDescription },
    });
    if (exists) continue;
    await prisma.serviceRequest.create({ data: r });
    console.log(`  request ✓ ${r.serviceType} (${r.status})`);
  }

  console.log('\nSeed complete. Login credentials:');
  console.log('  ADMIN  → admin@vsms.dev   / Admin@123');
  console.log('  USER   → alice@vsms.dev   / User@123');
  console.log('  USER   → bob@vsms.dev     / User@123');
  console.log('  USER   → charlie@vsms.dev / User@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
