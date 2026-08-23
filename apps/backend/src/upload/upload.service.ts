import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';
import { promises as fs } from 'fs';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly s3: S3Client | null = null;
  private readonly bucket: string;
  private readonly publicUrl: string;
  private readonly localUploadPath = join(process.cwd(), 'public', 'uploads');

  constructor(private readonly config: ConfigService) {
    const accountId = config.get<string>('R2_ACCOUNT_ID');
    const accessKeyId = config.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = config.get<string>('R2_SECRET_ACCESS_KEY');
    this.bucket = config.get<string>('R2_BUCKET') ?? 'product-images';
    this.publicUrl = (config.get<string>('R2_PUBLIC_URL') ?? '').replace(/\/$/, '');

    if (accountId && accessKeyId && secretAccessKey && this.publicUrl) {
      this.s3 = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId, secretAccessKey },
      });
      this.logger.log('Image storage: Cloudflare R2');
    } else {
      this.logger.warn('R2 credentials not fully set — using local disk storage');
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

    if (this.s3) {
      return this.uploadToR2(processed);
    }
    return this.saveLocally(processed);
  }

  private async uploadToR2(buffer: Buffer): Promise<string> {
    const path = `products/${uuidv4()}.webp`;
    await this.s3!.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: path,
        Body: buffer,
        ContentType: 'image/webp',
        CacheControl: 'max-age=3600',
      }),
    );
    return `${this.publicUrl}/${path}`;
  }

  private async saveLocally(buffer: Buffer): Promise<string> {
    const fileName = `${uuidv4()}.webp`;
    await fs.writeFile(join(this.localUploadPath, fileName), buffer);
    return `/uploads/${fileName}`;
  }
}
