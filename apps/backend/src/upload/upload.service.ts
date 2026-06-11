import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';
import { promises as fs } from 'fs';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly supabase: SupabaseClient | null = null;
  private readonly bucket: string;
  private readonly localUploadPath = join(process.cwd(), 'public', 'uploads');

  constructor(private readonly config: ConfigService) {
    const url = config.get<string>('SUPABASE_URL');
    const key = config.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    this.bucket = config.get<string>('SUPABASE_STORAGE_BUCKET') ?? 'product-images';

    if (url && key) {
      this.supabase = createClient(url, key);
      this.logger.log('Image storage: Supabase Storage');
    } else {
      this.logger.warn('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — using local disk storage');
      this.ensureLocalDir();
    }
  }

  private async ensureLocalDir() {
    await fs.mkdir(this.localUploadPath, { recursive: true });
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }

    const processed = await sharp(file.buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    if (this.supabase) {
      return this.uploadToSupabase(processed);
    }
    return this.saveLocally(processed);
  }

  private async uploadToSupabase(buffer: Buffer): Promise<string> {
    const path = `products/${uuidv4()}.webp`;
    const { error } = await this.supabase!.storage
      .from(this.bucket)
      .upload(path, buffer, { contentType: 'image/webp', upsert: false });

    if (error) throw new Error(`Supabase upload failed: ${error.message}`);

    const { data } = this.supabase!.storage.from(this.bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  private async saveLocally(buffer: Buffer): Promise<string> {
    const fileName = `${uuidv4()}.webp`;
    await fs.writeFile(join(this.localUploadPath, fileName), buffer);
    return `/uploads/${fileName}`;
  }
}
