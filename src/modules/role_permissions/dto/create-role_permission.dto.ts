import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, Min } from 'class-validator';

export class CreateRolePermissionDto {
  @ApiProperty({
    example: 1,
    required: true,
    minimum: 1,
    description: 'Id del rol',
  })
  @IsInt()
  @Min(1)
  roleId: number;

  @ApiProperty({
    example: [1, 2, 3],
    required: true,
    description: 'Arreglo de IDs de los permisos',
    type: [Number],
  })
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  permissions: number[];
}
