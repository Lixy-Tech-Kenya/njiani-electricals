import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PRODUCT_CATEGORIES } from '@njiani/shared';
import slugify from 'slugify';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  // 1. Create Admin User
  const passwordHash = await bcrypt.hash('Admin@1234', 10);
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
  console.log('Admin user created.');

  // 2. Create Categories
  const categoryMap = new Map<string, string>();
  for (const catName of PRODUCT_CATEGORIES) {
    const slug = slugify(catName, { lower: true });
    const category = await prisma.category.upsert({
      where: { name: catName },
      update: {},
      create: {
        name: catName,
        slug,
        sortOrder: PRODUCT_CATEGORIES.indexOf(catName),
      },
    });
    categoryMap.set(catName, category.id);
  }
  console.log('Categories created.');

  // 3. Create Sample Products
  const sampleProducts = [
    {
      name: 'Modern Chandelier LED',
      sku: 'CH-001',
      price: 1500000, // 15,000.00 KES
      category: 'Chandeliers',
      description: 'Elegant LED chandelier for modern living rooms. Energy efficient and stylish.',
    },
    {
      name: 'Smart WiFi Switch',
      sku: 'SW-002',
      price: 250000, // 2,500.00 KES
      category: 'Switches',
      description: 'Control your lights from anywhere with this smart WiFi enabled switch.',
    },
    {
      name: 'Outdoor Garden Light 10W',
      sku: 'OD-003',
      price: 450000, // 4,500.00 KES
      category: 'Outdoor & Garden Electrical Accessories',
      description: 'Waterproof garden light, perfect for illuminating pathways and garden features.',
    },
    {
      name: 'Heavy Duty Extension 5m',
      sku: 'EX-004',
      price: 180000, // 1,800.00 KES
      category: 'Extension Cables',
      description: '5 meter heavy duty extension cable with surge protection.',
    },
    {
      name: 'Solar Floodlight 100W',
      sku: 'SL-005',
      price: 850000, // 8,500.00 KES
      category: 'Solar Floodlights',
      description: 'High brightness solar floodlight with remote control and auto-on at dusk.',
    },
  ];

  for (const p of sampleProducts) {
    const slug = slugify(p.name, { lower: true });
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        name: p.name,
        sku: p.sku,
        slug,
        price: p.price,
        description: p.description,
        categoryId: categoryMap.get(p.category)!,
        status: 'ACTIVE',
        isFeatured: true,
        stockQuantity: 100,
        lowStockThreshold: 10,
        imageUrls: ['/uploads/sample.webp'],
      },
    });
  }
  console.log('Sample products created.');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
