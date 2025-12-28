import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create default admin user
  const adminPassword = await bcrypt.hash('admin', 10);
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
  console.log(`✅ Admin user created: ${admin.username} (${admin.email})`);

  // Create default test user
  const userPassword = await bcrypt.hash('user001', 10);
  const user001 = await prisma.user.upsert({
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
  console.log(`✅ Test user created: ${user001.username} (${user001.email})`);

  // Create sample pack
  const samplePack = await prisma.pack.upsert({
    where: { set_code: 'LOB' },
    update: {},
    create: {
      set_code: 'LOB',
      title: 'Legend of Blue Eyes White Dragon',
      title_jp: '青眼の白龍の伝説',
      language: 'EN',
      release_date: new Date('2002-03-08'),
      set_type: 'BOOSTER',
      total_cards: 3,
    },
  });
  console.log(`✅ Sample pack created: ${samplePack.title}`);

  // Create sample cards
  const sampleCards = [
    {
      card_number: 'LOB-EN001',
      set_code: 'LOB',
      set_position: '001',
      konami_id: '89631139',
      name: 'Blue-Eyes White Dragon',
      name_jp: '青眼の白龍',
      card_type: 'MONSTER' as const,
      frame_color: 'NORMAL' as const,
      attribute: 'LIGHT' as const,
      monster_type: 'Dragon',
      monster_abilities: [],
      level: 8,
      atk: '3000',
      def: '2500',
      card_text: 'This legendary dragon is a powerful engine of destruction. Virtually invincible, very few have faced this awesome creature and lived to tell the tale.',
      rarity: 'ULTRA_RARE' as const,
      tcg_legal: true,
      ocg_legal: true,
      ban_status: 'UNLIMITED' as const,
      pack_id: samplePack.id,
    },
    {
      card_number: 'LOB-EN002',
      set_code: 'LOB',
      set_position: '002',
      konami_id: '46986414',
      name: 'Dark Magician',
      name_jp: 'ブラック・マジシャン',
      card_type: 'MONSTER' as const,
      frame_color: 'NORMAL' as const,
      attribute: 'DARK' as const,
      monster_type: 'Spellcaster',
      monster_abilities: [],
      level: 7,
      atk: '2500',
      def: '2100',
      card_text: 'The ultimate wizard in terms of attack and defense.',
      rarity: 'ULTRA_RARE' as const,
      tcg_legal: true,
      ocg_legal: true,
      ban_status: 'UNLIMITED' as const,
      pack_id: samplePack.id,
    },
    {
      card_number: 'LOB-EN003',
      set_code: 'LOB',
      set_position: '003',
      konami_id: '74677422',
      name: 'Red-Eyes Black Dragon',
      name_jp: '真紅眼の黒竜',
      card_type: 'MONSTER' as const,
      frame_color: 'NORMAL' as const,
      attribute: 'DARK' as const,
      monster_type: 'Dragon',
      monster_abilities: [],
      level: 7,
      atk: '2400',
      def: '2000',
      card_text: 'A ferocious dragon with a deadly attack.',
      rarity: 'ULTRA_RARE' as const,
      tcg_legal: true,
      ocg_legal: true,
      ban_status: 'UNLIMITED' as const,
      pack_id: samplePack.id,
    },
  ];

  for (const cardData of sampleCards) {
    const card = await prisma.card.upsert({
      where: { card_number: cardData.card_number },
      update: {},
      create: cardData,
    });
    console.log(`✅ Sample card created: ${card.name}`);
  }

  // Create sample collection for user001
  const sampleCollection = await prisma.collection.upsert({
    where: { 
      user_id_name: {
        user_id: user001.id,
        name: 'My First Collection',
      }
    },
    update: {},
    create: {
      user_id: user001.id,
      name: 'My First Collection',
      description: 'A starter collection with iconic cards',
      is_public: false,
    },
  });
  console.log(`✅ Sample collection created: ${sampleCollection.name}`);

  // Create sample deck for user001
  const sampleDeck = await prisma.deck.upsert({
    where: { 
      user_id_name: {
        user_id: user001.id,
        name: 'Blue-Eyes Deck',
      }
    },
    update: {},
    create: {
      user_id: user001.id,
      name: 'Blue-Eyes Deck',
      description: 'A deck focused on Blue-Eyes White Dragon',
      format: 'Advanced',
      is_public: false,
    },
  });
  console.log(`✅ Sample deck created: ${sampleDeck.name}`);

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📋 Default Accounts:');
  console.log('   Admin:  admin / admin');
  console.log('   User:   user001 / user001');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
