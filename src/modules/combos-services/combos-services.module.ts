import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CombosServiceEntity } from './entities/combos-service.entity';
import { CombosServicesController } from './combos-services.controller';
import { CombosServicesService } from './combos-services.service';
import { CombosModule } from '../combos/combos.module';
import { ServicesTypeVehicleModule } from '../services-type-vehicle/services-type-vehicle.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([CombosServiceEntity]),
        CombosModule,
        ServicesTypeVehicleModule,
    ],
    controllers: [CombosServicesController],
    providers: [CombosServicesService],
})
export class CombosServicesModule {}