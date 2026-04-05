import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Combo } from './entities/combo.entity';
import { CombosController } from './combos.controller';
import { CombosService } from './combos.service';
import { ServicesTypeVehicleModule } from '../services-type-vehicle/services-type-vehicle.module';
import { CombosServiceEntity } from '../combos-services/entities/combos-service.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Combo, CombosServiceEntity]),
    ServicesTypeVehicleModule,

  ],
  controllers: [CombosController],
  providers: [CombosService],
  exports: [CombosService],
})
export class CombosModule {}