import { Module } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { PurchasesController } from './purchases.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Purchase } from './entities/purchase.entity';
import { PurchaseItem } from '../purchases_items/entities/purchase_items.entity';
import { ProductsModule } from '../products/products.module';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { PaymentsMethodsModule } from '../payments-methods/payments-methods.module';

@Module({
  imports: [TypeOrmModule.forFeature([Purchase, PurchaseItem]), ProductsModule, SuppliersModule, PaymentsMethodsModule],
  controllers: [PurchasesController],
  providers: [PurchasesService],
})
export class PurchasesModule {}
