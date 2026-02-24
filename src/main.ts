import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // CORS configuration
  const corsOrigin = configService.get<string>('CORS_ORIGIN') || '*';
  app.enableCors({
    origin: corsOrigin === '*' ? '*' : corsOrigin.split(','),
    credentials: true,
  });

  // Request logging middleware
  app.use((req, res, next) => {
    const startTime = Date.now();
    logger.log(`[REQUEST] ${req.method} ${req.url}`);
    logger.log(`[HEADERS] ${JSON.stringify(req.headers)}`);
    if (req.body && Object.keys(req.body).length > 0) {
      logger.log(`[BODY] ${JSON.stringify(req.body, null, 2)}`);
    }

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      logger.log(`[RESPONSE] ${req.method} ${req.url} - Status: ${res.statusCode} - ${duration}ms`);
    });

    next();
  });

  // Global validation pipe with detailed error messages
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        logger.error(`[VALIDATION ERROR] ${JSON.stringify(errors, null, 2)}`);
        const formattedErrors = errors.map((error) => ({
          field: error.property,
          constraints: Object.values(error.constraints || {}),
          children: error.children?.map((child) => ({
            field: child.property,
            constraints: Object.values(child.constraints || {}),
          })),
        }));

        return {
          message: 'Validation failed',
          errors: formattedErrors,
        };
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
  logger.log(`Application is running on: http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
