import { Module } from '@nestjs/common';
import { PaymentsMethodsService } from './payments-methods.service';
import { PaymentsMethodsController } from './payments-methods.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethod } from './entities/payment-method.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentMethod])],
  controllers: [PaymentsMethodsController],
  providers: [PaymentsMethodsService],
  exports: [PaymentsMethodsService],
})
export class PaymentsMethodsModule {}