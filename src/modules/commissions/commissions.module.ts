import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Commission } from './entities/commission.entity';
import { CommissionsController } from './commissions.controller';
import { CommissionsService } from './commissions.service';
import { EmployeesModule } from '../employees/employees.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Commission]),
        EmployeesModule,
    ],
    controllers: [CommissionsController],
    providers: [CommissionsService],
})
export class CommissionsModule {}