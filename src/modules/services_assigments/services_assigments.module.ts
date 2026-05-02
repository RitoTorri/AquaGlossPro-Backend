import { Module } from '@nestjs/common';
import { ServicesAssigmentsService } from './services_assigments.service';
import { ServicesAssigmentsController } from './services_assigments.controller';

@Module({
  controllers: [ServicesAssigmentsController],
  providers: [ServicesAssigmentsService],
})
export class ServicesAssigmentsModule {}
