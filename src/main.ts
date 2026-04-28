import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { configSwagger } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const frontendUrl = configService.get<string>('FRONTEND_URL');
  const logger = new Logger('Bootstrap');
  const port = process.env.PORT ?? 3000;

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  // Habilitar el pipe de validación de forma global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // Elimina propiedades que no estén en el DTO
      transform: true,       // ¡CLAVE! Transforma los tipos automáticamente
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  
  const documentFactory = () => SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup('docs', app, documentFactory);

  await app.listen(port);
  logger.log(`🚀 Server started on http://localhost:${port}`);
  logger.log(`📄 Documentation available at http://localhost:${port}/docs`);
}
bootstrap();
