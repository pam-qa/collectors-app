import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Cleanup script to remove all non-One Piece cards and packs
 * Keeps only OP-13 (One Piece) data
 */
async function main() {
  console.log('🧹 Cleaning up non-One Piece data...\n');

  try {
    // Find all packs that are NOT OP-13
    const nonOPPacks = await prisma.pack.findMany({
      where: {
        NOT: {
          set_code: 'OP13',
        },
      },
      include: {
        _count: {
          select: { cards: true },
        },
      },
    });

    console.log(`Found ${nonOPPacks.length} non-OP packs to delete:`);
    for (const pack of nonOPPacks) {
      console.log(`  - ${pack.set_code}: ${pack.title} (${pack._count.cards} cards)`);
    }

    // Delete cards from non-OP packs first (to avoid foreign key issues)
    for (const pack of nonOPPacks) {
      const deletedCards = await prisma.card.deleteMany({
        where: {
          pack_id: pack.id,
        },
      });
      console.log(`  ✅ Deleted ${deletedCards.count} cards from ${pack.set_code}`);
    }

    // Delete non-OP packs
    for (const pack of nonOPPacks) {
      await prisma.pack.delete({
        where: { id: pack.id },
      });
      console.log(`  ✅ Deleted pack: ${pack.set_code}`);
    }

    // Also delete any cards that don't belong to OP-13 pack
    const op13Pack = await prisma.pack.findUnique({
      where: { set_code: 'OP13' },
    });

    if (op13Pack) {
      const orphanedCards = await prisma.card.deleteMany({
        where: {
          NOT: {
            pack_id: op13Pack.id,
          },
        },
      });
      console.log(`  ✅ Deleted ${orphanedCards.count} orphaned cards`);
    }

    // Count remaining cards
    const remainingCards = await prisma.card.count({
      where: {
        pack: {
          set_code: 'OP13',
        },
      },
    });

    console.log('\n✅ Cleanup completed!');
    console.log(`📊 Remaining: ${remainingCards} OP-13 cards in database\n`);

    if (remainingCards < 175) {
      console.log(`⚠️  Note: OP-13 set has 175 cards total, but only ${remainingCards} are in database.`);
      console.log('   Use bulk import to add the remaining cards.\n');
    }
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });


