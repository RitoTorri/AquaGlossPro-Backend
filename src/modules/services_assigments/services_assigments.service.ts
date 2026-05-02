import { Injectable } from '@nestjs/common';
import { CreateServicesAssigmentDto } from './dto/create-services_assigment.dto';
import { UpdateServicesAssigmentDto } from './dto/update-services_assigment.dto';

@Injectable()
export class ServicesAssigmentsService {
  create(createServicesAssigmentDto: CreateServicesAssigmentDto) {
    return 'This action adds a new servicesAssigment';
  }

  findAll() {
    return `This action returns all servicesAssigments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} servicesAssigment`;
  }

  update(id: number, updateServicesAssigmentDto: UpdateServicesAssigmentDto) {
    return `This action updates a #${id} servicesAssigment`;
  }

  remove(id: number) {
    return `This action removes a #${id} servicesAssigment`;
  }
}
