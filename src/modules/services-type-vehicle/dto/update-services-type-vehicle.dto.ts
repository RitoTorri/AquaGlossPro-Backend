import { PartialType } from '@nestjs/swagger';
import { CreateServicesTypeVehicleDto } from './create-services-type-vehicle.dto';

export class UpdateServicesTypeVehicleDto extends PartialType(CreateServicesTypeVehicleDto) {}