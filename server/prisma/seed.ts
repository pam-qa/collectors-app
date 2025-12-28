import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  const saltRounds = 10;

  // ===== Create Admin User =====
  const adminPassword = await bcrypt.hash('admin', saltRounds);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@tcgapp.local',
      password_hash: adminPassword,
      role: 'ADMIN',
      is_active: true,
    },
  });
  console.log('✅ Admin user created/verified:');
  console.log(`   Username: admin`);
  console.log(`   Password: admin`);
  console.log(`   Email: ${admin.email}`);
  console.log(`   Role: ${admin.role}\n`);

  // ===== Create Default User =====
  const userPassword = await bcrypt.hash('user001', saltRounds);
  const user = await prisma.user.upsert({
    where: { username: 'user001' },
    update: {},
    create: {
      username: 'user001',
      email: 'user001@tcgapp.local',
      password_hash: userPassword,
      role: 'USER',
      is_active: true,
    },
  });
  console.log('✅ Default user created/verified:');
  console.log(`   Username: user001`);
  console.log(`   Password: user001`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Role: ${user.role}\n`);

  // ===== Create Sample Pack (Optional) =====
  const samplePack = await prisma.pack.upsert({
    where: { set_code: 'LOB' },
    update: {},
    create: {
      set_code: 'LOB',
      title: 'Legend of Blue Eyes White Dragon',
      title_jp: '青眼の白龍伝説',
      language: 'EN',
      release_date: new Date('2002-03-08'),
      set_type: 'BOOSTER',
      total_cards: 126,
    },
  });
  console.log('✅ Sample pack created/verified:');
  console.log(`   Set Code: ${samplePack.set_code}`);
  console.log(`   Title: ${samplePack.title}\n`);

  console.log('🎉 Database seed completed successfully!');
  console.log('\n📋 Default Accounts Summary:');
  console.log('┌──────────┬──────────┬───────────────────────┬───────┐');
  console.log('│ Username │ Password │ Email                 │ Role  │');
  console.log('├──────────┼──────────┼───────────────────────┼───────┤');
  console.log('│ admin    │ admin    │ admin@tcgapp.local    │ ADMIN │');
  console.log('│ user001  │ user001  │ user001@tcgapp.local  │ USER  │');
  console.log('└──────────┴──────────┴───────────────────────┴───────┘');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

