import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // 1. Importa TypeOrmModule
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { Role } from './entities/role.entity'; // 2. Importa tu entidad

@Module({
  imports: [TypeOrmModule.forFeature([Role])], // 3. Regístralo aquí
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}