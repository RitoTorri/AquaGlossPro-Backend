import { IsString, MinLength, MaxLength, Matches, IsNotEmpty, } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class RoleDto {
    @ApiProperty({
        example: 'vendedor',
        required: true,
        description: 'Nombre del rol',
        minLength: 3,
        maxLength: 50,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    @Matches(/^[a-zA-Z/s]*$/)
    @Transform(({ value }) => value.toLowerCase())
    name: string;
}
