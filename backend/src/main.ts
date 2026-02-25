import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Parse cookies (needed for refresh token)
  app.use(cookieParser());

  // Validate all incoming requests using DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,     // Strip unknown properties
    transform: true,     // Auto-transform types
    forbidNonWhitelisted: true, // Reject unknown properties
  }));

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,   // Allow cookies cross-origin
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 StudyNest backend running on http://localhost:${port}`);
}
bootstrap();