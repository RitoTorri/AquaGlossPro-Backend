import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength, IsEmail, Matches, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateEmployeeDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  jobId: number;

  @ApiProperty({ example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(40)
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\.]+$/, {
    message: 'El campo solo puede contener letras, acentos, espacios y puntos',
  })
  @Transform(({ value }) => value.toUpperCase())
  names: string;

  @ApiProperty({ example: 'Perez' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(40)
  @Matches(/^[a-zA-Z\s]+$/)
  @Transform(({ value }) => value.toUpperCase())
  lastnames: string;

  @ApiProperty({ example: 'juan@mail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+58-4121234567' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[0-9]{2}-[0-9]{8,21}$/)
  numberPhone: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  @MaxLength(15)
  ci: string;
}
