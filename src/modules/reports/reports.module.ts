// src/modules/reports/reports.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
// Solo mantenemos las entidades que realmente tienes en tu proyecto
import { Commission } from '../commissions/entities/commission.entity';
import { PaymentMethod } from '../payments-methods/entities/payment-method.entity';
import { Service } from '../services/entities/service.entity';
import { TypeVehicle } from '../type-vehicle/entities/type-vehicle.entity';
import { Employee } from '../employees/entities/employee.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Commission, PaymentMethod, Service, TypeVehicle, Employee]),
    ],
    controllers: [ReportsController],
    providers: [ReportsService],
})
export class ReportsModule {}