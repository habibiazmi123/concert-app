import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 3001;

  // Global prefix
  app.setGlobalPrefix('api');

  // Swagger / OpenAPI
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Concert Booking API')
    .setDescription(
      'API documentation for the Concert Ticket Booking platform. ' +
      'Supports user authentication, concert browsing, ticket booking with queue-based concurrency, ' +
      'payments, and admin management.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Global filters and interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
  );

  await app.listen(port);
  logger.log(`🎵 Concert Booking API running on http://localhost:${port}/api`);
  logger.log(`📖 Swagger docs available at http://localhost:${port}/api/docs`);
  logger.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();
