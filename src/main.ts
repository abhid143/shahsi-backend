import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { HttpExceptionFilter } from './shared/utils/http-exception.filter';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔥 Stripe Webhook RAW BODY (VERY IMPORTANT)
  app.use(
    '/webhook/stripe',
    bodyParser.raw({ type: 'application/json' }),
  );

  // Winston Logger
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Global Validation 
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, 
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global Exception Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle('Shahsi API')
    .setDescription('Shahsi Backend API Docs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3001);
}

bootstrap();