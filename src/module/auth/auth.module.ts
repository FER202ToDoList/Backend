import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UserRepository } from "../user/user.repository";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { getJwtExpiresIn, getJwtSecretKey } from "src/config/global-const";
import { JwtStrategy } from "./strategy/jwt.strategy";

@Module({
    imports: [
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: getJwtSecretKey(configService)!,
                signOptions: {
                    expiresIn: getJwtExpiresIn(configService),
                },
            }),
        })
    ],
    controllers: [AuthController],
    providers: [AuthService, UserRepository, JwtStrategy],
})
export class AuthModule {}