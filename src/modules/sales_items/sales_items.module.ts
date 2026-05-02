import { Module } from '@nestjs/common';
import { SalesItemsService } from './sales_items.service';

@Module({
  providers: [SalesItemsService]
})
export class SalesItemsModule {}
