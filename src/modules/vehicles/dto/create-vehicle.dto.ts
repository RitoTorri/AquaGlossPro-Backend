import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength, Min, IsNumber } from 'class-validator';

export class CreateVehicleDto {
    @ApiProperty({
        example: '1',
        description: 'Identificador del tipo de vehículo',
        minimum: 1
    })
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    typeVehicleId: number;

    @ApiProperty({
        example: '1',
        description: 'Identificador del cliente',
        minimum: 1
    })
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    ownerId: number;

    @ApiProperty({
        example: 'ABC123',
        description: 'Identificador de la placa',
        minLength: 3,
        maxLength: 20,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(20)
    plate: string;
}