import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? 'product-images';
const CATEGORY_NAME = 'Other Items';

const IMPORT_DIR = join(process.cwd(), 'catalogue-import', 'archer-lighting');
const IMAGES_DIR = join(IMPORT_DIR, 'images');

type ManifestEntry = { code: string; slug: string; images: string[] };

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const prisma = new PrismaClient();

async function uploadImage(filename: string): Promise<string> {
  const buffer = readFileSync(join(IMAGES_DIR, filename));
  const path = `products/archer-${filename}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: 'image/webp', upsert: true });
  if (error) throw new Error(`Upload failed for ${filename}: ${error.message}`);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function main() {
  const manifest: ManifestEntry[] = JSON.parse(
    readFileSync(join(IMPORT_DIR, 'manifest.json'), 'utf-8'),
  );
  console.log(`Found ${manifest.length} products in manifest`);

  const category = await prisma.category.findUnique({ where: { name: CATEGORY_NAME } });
  if (!category) {
    console.error(`Category "${CATEGORY_NAME}" not found — run the main seed first.`);
    process.exit(1);
  }

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const entry of manifest) {
    const sku = `ARCHER-${entry.code}`;
    const existing = await prisma.product.findUnique({ where: { sku } });
    if (existing) {
      skipped++;
      continue;
    }

    try {
      const imageUrls: string[] = [];
      for (const filename of entry.images) {
        imageUrls.push(await uploadImage(filename));
      }

      await prisma.product.create({
        data: {
          name: `Archer ${entry.code}`,
          sku,
          slug: `archer-${entry.slug}`,
          categoryId: category.id,
          price: 0,
          description: `Imported from the Archer Lighting supplier catalogue (item code ${entry.code}). Needs review: name, price, category and description before publishing.`,
          imageUrls,
          status: 'INACTIVE',
          stockQuantity: 0,
        },
      });
      created++;
      if (created % 25 === 0) console.log(`  Created ${created}/${manifest.length}...`);
    } catch (err) {
      console.error(`  FAILED: ${entry.code} —`, (err as Error).message);
      failed++;
    }
  }

  console.log(`\nDone. Created ${created}, skipped ${skipped} (already exist), failed ${failed}.`);
  console.log('All imported products are INACTIVE (draft) — review and activate them in the admin panel.');
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
