import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Archer Lighting item codes carry a supplier prefix that maps to a rough
// fixture type — confirmed by spot-checking sample photos per prefix:
// P/C/M/AP-prefixed codes are all pendant/chandelier-style fixtures, while
// W-prefixed codes are wall-mounted fixtures.
function categoryForCode(code: string): string {
  if (code.startsWith('W')) return 'Wall Brackets';
  return 'Chandeliers';
}

async function main() {
  const products = await prisma.product.findMany({
    where: { sku: { startsWith: 'ARCHER-' } },
    select: { id: true, sku: true, categoryId: true },
  });
  console.log(`Found ${products.length} Archer products`);

  const categories = await prisma.category.findMany({
    where: { name: { in: ['Chandeliers', 'Wall Brackets'] } },
  });
  const categoryIdByName = new Map(categories.map(c => [c.name, c.id]));
  if (categoryIdByName.size < 2) {
    console.error('Expected categories "Chandeliers" and "Wall Brackets" to exist — run the seed first.');
    process.exit(1);
  }

  let updated = 0;
  let unchanged = 0;
  for (const product of products) {
    const code = product.sku.replace(/^ARCHER-/, '');
    const targetName = categoryForCode(code);
    const targetId = categoryIdByName.get(targetName)!;
    if (product.categoryId === targetId) {
      unchanged++;
      continue;
    }
    await prisma.product.update({
      where: { id: product.id },
      data: { categoryId: targetId },
    });
    updated++;
  }

  console.log(`Done. Updated ${updated}, already correct ${unchanged}.`);
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
