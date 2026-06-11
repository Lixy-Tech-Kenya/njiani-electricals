import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? 'product-images';
const UPLOADS_DIR = join(process.cwd(), 'public', 'uploads');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const prisma = new PrismaClient();

async function uploadFile(filename: string): Promise<string> {
  const buffer = readFileSync(join(UPLOADS_DIR, filename));
  const ext = filename.split('.').pop() ?? 'jpeg';
  const contentType = ext === 'webp' ? 'image/webp' : 'image/jpeg';
  const path = `products/${filename}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType, upsert: true });

  if (error) throw new Error(`Upload failed for ${filename}: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function main() {
  const files = readdirSync(UPLOADS_DIR);
  console.log(`Found ${files.length} files in ${UPLOADS_DIR}`);

  // Build a map: /uploads/filename -> supabase public URL
  const urlMap = new Map<string, string>();
  let uploaded = 0;
  let failed = 0;

  for (const filename of files) {
    try {
      const publicUrl = await uploadFile(filename);
      urlMap.set(`/uploads/${filename}`, publicUrl);
      uploaded++;
      if (uploaded % 50 === 0) console.log(`  Uploaded ${uploaded}/${files.length}...`);
    } catch (err) {
      console.error(`  FAILED: ${filename} —`, (err as Error).message);
      failed++;
    }
  }

  console.log(`\nUpload complete: ${uploaded} succeeded, ${failed} failed`);

  // Update product imageUrls in the database
  const products = await prisma.product.findMany({
    select: { id: true, imageUrls: true },
  });

  let updated = 0;
  for (const product of products) {
    const newUrls = product.imageUrls.map(url => urlMap.get(url) ?? url);
    const changed = newUrls.some((url, i) => url !== product.imageUrls[i]);
    if (changed) {
      await prisma.product.update({
        where: { id: product.id },
        data: { imageUrls: newUrls },
      });
      updated++;
    }
  }

  console.log(`Updated ${updated} products in the database`);
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
