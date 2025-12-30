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

  // Create One Piece OP-13 pack
  const op13Pack = await prisma.pack.upsert({
    where: { set_code: 'OP13' },
    update: {},
    create: {
      set_code: 'OP13',
      title: 'Carrying on His Will',
      title_jp: '意志を継ぐもの',
      language: 'JP',
      release_date: new Date('2025-11-07'),
      set_type: 'BOOSTER',
      total_cards: 175,
    },
  });
  console.log(`✅ Pack created: ${op13Pack.title} (OP13)`);

  // Create sample One Piece OP-13 cards
  // Note: One Piece cards use different terminology (Leader/Character/Event)
  // We're adapting the schema to work with One Piece cards
  const op13SampleCards = [
    {
      card_number: 'OP13-001',
      set_code: 'OP13',
      set_position: '001',
      name: 'Monkey D. Luffy',
      name_jp: 'モンキー・D・ルフィ',
      card_type: 'MONSTER' as const, // Leader cards stored as MONSTER type
      frame_color: 'EFFECT' as const,
      attribute: 'FIRE' as const,
      monster_type: 'Leader',
      monster_abilities: ['Leader'],
      level: 4, // Life value
      atk: '5000',
      def: null,
      card_text: 'DON!!×1 【相手のアタック時】 自分のアクティブのドン!!が5枚以下の場合、自分のドン!!を任意の枚数レストにできる。レストにしたドン!!1枚につき、このリーダーか自分の特徴《麦わらの一味》を持つキャラ1枚までを、このバトル中、パワー+2000。',
      rarity: 'SECRET_RARE' as const,
      tcg_legal: false,
      ocg_legal: true,
      ban_status: 'UNLIMITED' as const,
      pack_id: op13Pack.id,
      language: 'JP' as const,
    },
    {
      card_number: 'OP13-002',
      set_code: 'OP13',
      set_position: '002',
      name: 'Portgas D. Ace',
      name_jp: 'ポートガス・D・エース',
      card_type: 'MONSTER' as const,
      frame_color: 'EFFECT' as const,
      attribute: 'FIRE' as const,
      monster_type: 'Leader',
      monster_abilities: ['Leader'],
      level: 3,
      atk: '6000',
      def: null,
      rarity: 'SECRET_RARE' as const,
      tcg_legal: false,
      ocg_legal: true,
      ban_status: 'UNLIMITED' as const,
      pack_id: op13Pack.id,
      language: 'JP' as const,
    },
    {
      card_number: 'OP13-003',
      set_code: 'OP13',
      set_position: '003',
      name: 'Gol D. Roger',
      name_jp: 'ゴール・D・ロジャー',
      card_type: 'MONSTER' as const,
      frame_color: 'EFFECT' as const,
      attribute: 'WATER' as const,
      monster_type: 'Leader',
      monster_abilities: ['Leader'],
      level: 5,
      atk: '7000',
      def: null,
      rarity: 'SECRET_RARE' as const,
      tcg_legal: false,
      ocg_legal: true,
      ban_status: 'UNLIMITED' as const,
      pack_id: op13Pack.id,
      language: 'JP' as const,
    },
  ];

  for (const cardData of op13SampleCards) {
    const card = await prisma.card.upsert({
      where: { card_number: cardData.card_number },
      update: {},
      create: cardData,
    });
    console.log(`✅ Card created: ${card.name_jp || card.name} (${card.card_number})`);
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
      name: 'One Piece OP-13 Deck',
      description: 'A deck from Carrying on His Will set',
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
