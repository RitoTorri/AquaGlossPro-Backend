import { PartialType } from '@nestjs/swagger';
import { CreateCombosServiceDto } from './create-combos-service.dto';

export class UpdateCombosServiceDto extends PartialType(CreateCombosServiceDto) {}