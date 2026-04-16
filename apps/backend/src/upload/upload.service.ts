import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import sharp from 'sharp';
import { join } from 'path';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly useCloudinary: boolean;
  private readonly localUploadPath = join(process.cwd(), 'public', 'uploads');

  constructor(private readonly config: ConfigService) {
    const cloudName = config.get<string>('CLOUDINARY_CLOUD_NAME');
    this.useCloudinary = !!cloudName;

    if (this.useCloudinary) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: config.get<string>('CLOUDINARY_API_KEY'),
        api_secret: config.get<string>('CLOUDINARY_API_SECRET'),
      });
      this.logger.log('Image storage: Cloudinary');
    } else {
      this.logger.warn('CLOUDINARY_CLOUD_NAME not set — using local disk storage');
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

    // Normalise to WebP at max 800×800 before uploading
    const processed = await sharp(file.buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    if (this.useCloudinary) {
      return this.uploadToCloudinary(processed);
    }
    return this.saveLocally(processed);
  }

  private uploadToCloudinary(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: 'njiani-products', resource_type: 'image', format: 'webp' },
          (err: Error | undefined, result: UploadApiResponse | undefined) => {
            if (err || !result) return reject(err ?? new Error('Cloudinary upload failed'));
            resolve(result.secure_url);
          },
        )
        .end(buffer);
    });
  }

  private async saveLocally(buffer: Buffer): Promise<string> {
    const fileName = `${uuidv4()}.webp`;
    await fs.writeFile(join(this.localUploadPath, fileName), buffer);
    return `/uploads/${fileName}`;
  }
}
