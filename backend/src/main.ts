import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import './config/load-env';
import { AppModule } from './app.module';

function buildAllowedOrigins() {
  const configuredOrigins = [
    process.env.FRONTEND_APP_URL,
    ...(process.env.CORS_ALLOWED_ORIGINS ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter((value) => value.length > 0),
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ];

  return Array.from(
    new Set(
      configuredOrigins
        .filter((origin): origin is string => typeof origin === 'string' && origin.length > 0)
        .map((origin) => origin.replace(/\/+$/, '')),
    ),
  );
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT) || 3000;
  const allowedOrigins = buildAllowedOrigins();
  const allowVercelPreviews = process.env.ALLOW_VERCEL_PREVIEWS !== 'false';

  app.enableCors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = origin.replace(/\/+$/, '');

      if (allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true);
        return;
      }

      if (
        allowVercelPreviews &&
        /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(normalizedOrigin)
      ) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${normalizedOrigin} is not allowed by CORS`), false);
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(port);
}

bootstrap();
