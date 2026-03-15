import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm'; // Carga de la configuración de TypeORM
import { TypeOrmConfigService } from './config/typeorm.config';
import { ModulesModule } from './modules/modules/modules.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { RolePermissionsModule } from './modules/role_permissions/role_permissions.module';
import { AuthModule } from './modules/auth/auth.module';
import { PermissionsController } from './modules/permissions/permissions.controller';
import { ClientsModule } from './modules/clients/clients.module';
import { ServicesModule } from './modules/services/services.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ProductsModule } from './modules/products/products.module';
import { PaymentsMethodsModule } from './modules/payments-methods/payments-methods.module';
import { TypeVehicleModule } from './modules/type-vehicle/type-vehicle.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';

@Module({
  imports: [
    // 1. Cargar variables de entorno (.env)
    ConfigModule.forRoot({
      isGlobal: true, // Hace que config sea accesible en to                      da la app
    }),

    // 2. Usar forRootAsync para cargar la configuración mediante la clase
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),

    ModulesModule,

    UsersModule,

    RolesModule,

    PermissionsModule,

    RolePermissionsModule,

    AuthModule,

    ClientsModule,

    ServicesModule,

    SuppliersModule,

    EmployeesModule,
    
    JobsModule,

    ProductsModule,

    PaymentsMethodsModule,

    TypeVehicleModule,

    VehiclesModule
  ],
  controllers: [PermissionsController]
})
export class AppModule { }
