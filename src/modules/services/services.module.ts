import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [TypeOrmModule.forFeature([Service]), CategoriesModule],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}