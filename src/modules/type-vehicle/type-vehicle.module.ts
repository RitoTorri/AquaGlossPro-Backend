import { Module } from '@nestjs/common';
import { TypeVehicleService } from './type-vehicle.service';
import { TypeVehicleController } from './type-vehicle.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeVehicle } from './entities/type-vehicle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TypeVehicle])],
  controllers: [TypeVehicleController],
  providers: [TypeVehicleService],
  exports: [TypeVehicleService],
})
export class TypeVehicleModule {}