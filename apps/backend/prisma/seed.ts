import 'reflect-metadata';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PRODUCT_CATEGORIES } from '@njiani/shared';
import slugify from 'slugify';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ─── 1. Admin user ──────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Admin@2024', 10);
  await prisma.user.upsert({
    where: { email: 'admin@njiani.co.ke' },
    update: {},
    create: {
      email: 'admin@njiani.co.ke',
      passwordHash,
      name: 'Njiani Admin',
      role: 'ADMIN',
    },
  });
  console.log('✓ Admin user: admin@njiani.co.ke / Admin@2024');

  // ─── 2. Categories (all 21) ─────────────────────────────────────────────────
  const categoryMap = new Map<string, string>();
  for (let i = 0; i < PRODUCT_CATEGORIES.length; i++) {
    const catName = PRODUCT_CATEGORIES[i];
    const slug = slugify(catName, { lower: true, strict: true });
    const category = await prisma.category.upsert({
      where: { name: catName },
      update: { sortOrder: i },
      create: { name: catName, slug, sortOrder: i },
    });
    categoryMap.set(catName, category.id);
  }
  console.log(`✓ ${PRODUCT_CATEGORIES.length} categories seeded`);

  // ─── 3. Sample products ─────────────────────────────────────────────────────
  const UNS = 'https://images.unsplash.com/photo';
  const imgOpts = 'w=900&q=80&auto=format&fit=crop';

  const sampleProducts = [
    // Featured (first 4)
    {
      name: 'Modern Crystal Chandelier 24-Head',
      sku: 'CH-001',
      price: 1500000,          // KES 15,000
      category: 'Chandeliers',
      description:
        'Elegant 24-head crystal chandelier for modern dining rooms and living areas. Energy-efficient LED bulbs included. Ceiling mount kit provided.',
      isFeatured: true,
      imageUrls: [`${UNS}-1558618666-fcd25c85cd64?${imgOpts}`],
    },
    {
      name: 'Solar Floodlight 100W with Remote',
      sku: 'SFL-001',
      price: 850000,           // KES 8,500
      category: 'Solar Floodlights',
      description:
        'High-brightness 100W solar floodlight with motion sensor and remote control. Automatic dusk-to-dawn operation. IP67 waterproof rating.',
      isFeatured: true,
      imageUrls: [`${UNS}-1509391366360-2e959784a276?${imgOpts}`],
    },
    {
      name: 'LED Ceiling Light 36W Round',
      sku: 'LED-001',
      price: 320000,           // KES 3,200
      category: 'LED Ceiling Lights',
      description:
        'Slim 36W LED ceiling light with cool white illumination. Flush mount design suitable for bedrooms, offices and corridors. No bulbs required.',
      isFeatured: true,
      imageUrls: [`${UNS}-1565814329452-e1efa11c5b89?${imgOpts}`],
    },
    {
      name: 'Solar LED Streetlight 60W All-in-One',
      sku: 'SSL-001',
      price: 2200000,          // KES 22,000
      category: 'Solar Streetlights',
      description:
        'All-in-one solar streetlight with built-in panel, battery and LED chip. Suitable for roads, parking lots and compounds. Auto on/off with motion sensing.',
      isFeatured: true,
      imageUrls: [`${UNS}-1473341304170-971dccb5ac1e?${imgOpts}`],
    },
    // Non-featured
    {
      name: 'Smart WiFi Switch (Single Gang)',
      sku: 'SW-001',
      price: 185000,           // KES 1,850
      category: 'Switches',
      description:
        'Smart single-gang WiFi switch compatible with Alexa and Google Home. Requires neutral wire. Fits standard UK wall boxes.',
      isFeatured: false,
      imageUrls: [`${UNS}-1486325212027-8081e485255e?${imgOpts}`],
    },
    {
      name: 'Weatherproof Outdoor Wall Light',
      sku: 'OG-001',
      price: 450000,           // KES 4,500
      category: 'Outdoor & Garden Electrical Accessories',
      description:
        'IP65-rated outdoor wall lantern for gates, verandas and compound entrances. Warm white E27 bulb socket. Powder-coated aluminium body.',
      isFeatured: false,
      imageUrls: [`${UNS}-1565183928294-7063f23ce0f8?${imgOpts}`],
    },
    {
      name: 'Heavy Duty Extension Cable 5m (4-Way)',
      sku: 'EX-001',
      price: 180000,           // KES 1,800
      category: 'Extension Cables',
      description:
        '5-metre 4-way extension cable with surge protection and individual switches per socket. 13A rated. Child safety shutters on all sockets.',
      isFeatured: false,
      imageUrls: [`${UNS}-1497366216548-37526070297c?${imgOpts}`],
    },
    {
      name: 'LED Floodlight 50W (Cool White)',
      sku: 'LF-001',
      price: 280000,           // KES 2,800
      category: 'LED Floodlights',
      description:
        'Slim 50W LED floodlight for security lighting and sports courts. IP65 waterproof. Die-cast aluminium housing. 4500 lumens output.',
      isFeatured: false,
      imageUrls: [`${UNS}-1544551763-46a013bb70d5?${imgOpts}`],
    },
    {
      name: 'Waterproof Double Socket (IP66)',
      sku: 'SOC-001',
      price: 125000,           // KES 1,250
      category: 'Sockets (Waterproof & Non-Waterproof)',
      description:
        'IP66-rated outdoor double socket with protective covers. Suitable for garages, bathrooms and outdoor kitchens. 13A, BS standard.',
      isFeatured: false,
      imageUrls: [`${UNS}-1524593689594-aae2f26b75ab?${imgOpts}`],
    },
    {
      name: 'Rechargeable Emergency Lamp 30 LED',
      sku: 'RL-001',
      price: 95000,            // KES 950
      category: 'Rechargeable Lamps',
      description:
        'Portable 30-LED rechargeable lamp with up to 8 hours backup. Wall-mount bracket included. Auto-activates during power outages.',
      isFeatured: false,
      imageUrls: [`${UNS}-1519750157634-b6d493a0f77c?${imgOpts}`],
    },
  ];

  // Patch legacy products from earlier seed runs that have placeholder images
  const legacyImagePatches: { sku: string; imageUrls: string[] }[] = [
    { sku: 'SW-002', imageUrls: [`${UNS}-1486325212027-8081e485255e?${imgOpts}`] }, // Smart WiFi Switch
    { sku: 'SL-005', imageUrls: [`${UNS}-1509391366360-2e959784a276?${imgOpts}`] }, // Solar Floodlight 100W
    { sku: 'EX-004', imageUrls: [`${UNS}-1497366216548-37526070297c?${imgOpts}`] }, // Heavy Duty Extension
    { sku: 'OD-003', imageUrls: [`${UNS}-1565183928294-7063f23ce0f8?${imgOpts}`] }, // Outdoor Garden Light
  ];
  for (const patch of legacyImagePatches) {
    await prisma.product.updateMany({
      where: { sku: patch.sku },
      data: { imageUrls: patch.imageUrls },
    });
  }

  let created = 0;
  for (const p of sampleProducts) {
    const slug = slugify(p.name, { lower: true, strict: true });
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: { imageUrls: p.imageUrls },
      create: {
        name: p.name,
        sku: p.sku,
        slug,
        price: p.price,
        description: p.description,
        categoryId: categoryMap.get(p.category)!,
        status: 'ACTIVE',
        isFeatured: p.isFeatured,
        stockQuantity: 50,
        lowStockThreshold: 5,
        imageUrls: p.imageUrls,
      },
    });
    created++;
  }
  console.log(`✓ ${created} sample products seeded (4 featured)`);

  console.log('\n🎉 Seed complete!');
  console.log('   Admin login: admin@njiani.co.ke / Admin@2024');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
