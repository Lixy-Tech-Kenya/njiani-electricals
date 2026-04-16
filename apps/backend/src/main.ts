import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor, Logger, VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');
  const isProd = process.env.NODE_ENV === 'production';

  // Static Assets (local uploads — dev only; prod uses Cloudinary)
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Security Headers
  app.use(helmet({
    crossOriginResourcePolicy: { policy: isProd ? 'same-origin' : 'cross-origin' },
  }));

  // CORS — allow the configured front-ends; fail loudly if env vars missing in production
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.ADMIN_URL,
  ].filter(Boolean) as string[];

  if (isProd && allowedOrigins.length === 0) {
    throw new Error('FRONTEND_URL and ADMIN_URL must be set in production');
  }

  app.enableCors({
    origin: isProd ? allowedOrigins : ['http://localhost:3501', 'http://localhost:3502'],
    credentials: true,
  });

  // Cookies
  app.use(cookieParser());

  // Global Prefix
  app.setGlobalPrefix('api');

  // API Versioning (v1)
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Response Serialisation
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Swagger (dev only)
  if (!isProd) {
    const config = new DocumentBuilder()
      .setTitle('Njiani Electricals API')
      .setDescription('Njiani Electricals Online Marketplace API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));
    logger.log(`Swagger UI: http://localhost:${process.env.PORT ?? 3500}/api/docs`);
  }

  const port = process.env.PORT ?? 3500;
  await app.listen(port, '0.0.0.0');
  logger.log(`Application running on port ${port}`);
}
bootstrap();
