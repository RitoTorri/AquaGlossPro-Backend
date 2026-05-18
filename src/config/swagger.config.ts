import { DocumentBuilder } from '@nestjs/swagger';
const port = process.env.PORT ?? 3000;

export const configSwagger = new DocumentBuilder()
    .setTitle('AquaGloss Pro Documentacion')
    .setDescription('Esta API proporciona una solución integral para la modernización y optimización de servicios de autolavados. Permite la automatización del flujo operativo completo: desde la recepción y entrada del vehículo hasta la liquidación contable.')
    .setVersion('1.0.0')
    .addServer(`http://localhost:${port}`)
    .setContact(
      'Jesus Francisco Cortez Torres', 
      'https://cortez-porfolio.netlify.app/', 
      'cortezfrancisco025@gmail.com'
    )
    .build();