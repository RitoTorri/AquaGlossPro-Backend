import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, MinLength, MaxLength, Matches, IsNotEmpty, IsLowercase } from 'class-validator';

export class CreateModuleDto {
    @ApiProperty({
        example: 'ventas',
        required: true,
        description: 'Nombre del módulo',
        minLength: 3,
        maxLength: 50,
    })
    @IsNotEmpty()
    @IsLowercase()
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    @Matches(/^[a-zA-Z\s]+$/, { message: 'Name can only contain letters and spaces' })
    @Transform(({ value }) => value.toLowerCase())
    name: string;
}
