import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeVehicle } from './entities/type-vehicle.entity';
import { TypeVehicleController } from './type-vehicle.controller';
import { TypeVehicleService } from './type-vehicle.service';

@Module({
    imports: [TypeOrmModule.forFeature([TypeVehicle])],
    controllers: [TypeVehicleController],
    providers: [TypeVehicleService],
    exports: [TypeVehicleService],
})
export class TypeVehicleModule {}