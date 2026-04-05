import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesTypeVehicle } from './entities/services-type-vehicle.entity';
import { ServicesTypeVehicleController } from './services-type-vehicle.controller';
import { ServicesTypeVehicleService } from './services-type-vehicle.service';
import { ServicesModule } from '../services/services.module';
import { TypeVehicleModule } from '../type-vehicle/type-vehicle.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServicesTypeVehicle]),
    ServicesModule,
    TypeVehicleModule,
  ],
  controllers: [ServicesTypeVehicleController],
  providers: [ServicesTypeVehicleService],
  exports: [ServicesTypeVehicleService],
})
export class ServicesTypeVehicleModule {}