import { PartialType } from '@nestjs/swagger';
import { CreateTypeVehicleDto } from './create-type-vehicle.dto';

export class UpdateTypeVehicleDto extends PartialType(CreateTypeVehicleDto) {}