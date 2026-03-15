import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Combo } from './entities/combo.entity';
import { CombosController } from './combos.controller';
import { CombosService } from './combos.service';

@Module({
    imports: [TypeOrmModule.forFeature([Combo])],
    controllers: [CombosController],
    providers: [CombosService],
    exports: [CombosService],
})
export class CombosModule {}