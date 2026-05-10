import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, Min, IsOptional, IsBoolean } from 'class-validator';

export class CreateServicesTypeVehicleDto {
    @ApiProperty({ example: 1, minimum: 1 })
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    serviceId: number;

    @ApiProperty({ example: 1, minimum: 1 })
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    typeVehicleId: number;

    @ApiProperty({ example: 50.0, minimum: 0 })
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    price: number;

    @ApiProperty({ required: false, default: true })
    @IsBoolean()
    @IsOptional()
    active?: boolean;
}