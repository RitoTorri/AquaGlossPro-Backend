import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CombosServiceEntity } from './entities/combos-service.entity';
import { CombosServicesService } from './combos-services.service';
import { CombosModule } from '../combos/combos.module';
import { ServicesTypeVehicleModule } from '../services-type-vehicle/services-type-vehicle.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CombosServiceEntity]),
    CombosModule,
    ServicesTypeVehicleModule,
  ],
  providers: [CombosServicesService],
  exports: [CombosServicesService],
})
export class CombosServicesModule {}