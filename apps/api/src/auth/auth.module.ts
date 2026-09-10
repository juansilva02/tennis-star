import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { LoginRateLimiter } from "./login-rate-limiter";

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>("JWT_SECRET");
        if (!secret || secret.length < 32) throw new Error("JWT_SECRET debe tener al menos 32 caracteres");
        return { secret };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LoginRateLimiter],
  exports: [JwtModule],
})
export class AuthModule {}
