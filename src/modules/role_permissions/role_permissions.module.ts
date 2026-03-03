import { Module } from '@nestjs/common';
import { RolePermissionsService } from './role_permissions.service';
import { RolePermissionsController } from './role_permissions.controller';
import { RolePermission } from './entities/role_permission.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsModule } from '../permissions/permissions.module';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [TypeOrmModule.forFeature([RolePermission]), PermissionsModule, RolesModule],
  controllers: [RolePermissionsController],
  providers: [RolePermissionsService],
})
export class RolePermissionsModule {}
