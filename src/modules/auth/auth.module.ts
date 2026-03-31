import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { RolePermission } from '../role_permissions/entities/role_permission.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt'; // <--- Importante
import { VerifyTokenGuard } from '../../shared/guards/verify-token.guard';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([RolePermission]), UsersModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, VerifyTokenGuard],
  exports: [AuthService],
})
export class AuthModule {}
