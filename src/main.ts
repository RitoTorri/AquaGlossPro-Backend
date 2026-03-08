import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

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

  const config = new DocumentBuilder()
    .setTitle('AquaGloss Pro Documentacion')
    .setDescription('Esta API proporciona una solución integral para la modernización y optimización de servicios de autolavados. Permite la automatización del flujo operativo completo: desde la recepción y entrada del vehículo hasta la liquidación contable.')
    .setVersion('1.0.0')
    .addServer(`http://localhost:${port}`)
    .setContact(
      'Jesus Francisco Cortez Torres', 
      'https://mi-portafolio-beta-mocha.vercel.app/', 
      'cortezfrancisco025@gmail.com'
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  await app.listen(port);
  logger.log(`🚀 Server started on http://localhost:${port}`);
  logger.log(`📄 Documentation available at http://localhost:${port}/docs`);
}
bootstrap();
