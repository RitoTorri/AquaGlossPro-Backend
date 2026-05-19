import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Combo } from './entities/combo.entity';
import { CombosController } from './combos.controller';
import { CombosService } from './combos.service';
import { ServicesModule } from '../services/services.module';  // ✅ Importar
import { CombosServiceEntity } from '../combos-services/entities/combos-service.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Combo, CombosServiceEntity]),
    ServicesModule,  // ✅ Para usar ServicesService
  ],
  controllers: [CombosController],
  providers: [CombosService],
  exports: [CombosService],
})
export class CombosModule {}