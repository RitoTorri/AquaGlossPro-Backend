import { PartialType } from '@nestjs/swagger';
import { CreateServicesAssigmentDto } from './create-services_assigment.dto';

export class UpdateServicesAssigmentDto extends PartialType(CreateServicesAssigmentDto) {}
