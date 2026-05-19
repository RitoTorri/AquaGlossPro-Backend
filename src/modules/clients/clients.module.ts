import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from '../../providers/mail/mail.module';
import { Client } from './entities/client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Client]), MailModule],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}
