import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true, // Errors are listed instead of removing
      transform: true, // Give you the exact data type
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
