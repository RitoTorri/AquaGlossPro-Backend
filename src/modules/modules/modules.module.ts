import { Module } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { ModulesController } from './modules.controller';
import { Modul } from './entities/module.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports : [TypeOrmModule.forFeature([Modul]), PermissionsModule],
  controllers: [ModulesController],
  providers: [ModulesService],
})
export class ModulesModule { }
