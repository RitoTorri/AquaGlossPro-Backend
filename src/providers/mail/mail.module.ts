import { Module } from '@nestjs/common';
import { MailService } from './mail.service';

@Module({
  // No necesitas importar el ConfigModule aquí si ya es global en el AppModule
  providers: [MailService],
  exports: [MailService], // ¡IMPORTANTE! Para que otros módulos puedan usarlo
})
export class MailModule {}