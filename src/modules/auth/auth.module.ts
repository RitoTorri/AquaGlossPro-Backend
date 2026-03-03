import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { RolePermission } from '../role_permissions/entities/role_permission.entity';
import { RefreshToken } from './entities/refreshToken.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt'; // <--- Importante
import { VerifyRefreshTokenGuard } from '../../shared/guards/verify-refresh-token.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken, RolePermission]),
    UsersModule,
    JwtModule.register({})
  ],
  controllers: [AuthController],
  providers: [AuthService, VerifyRefreshTokenGuard],
})
export class AuthModule { }
