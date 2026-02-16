import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from "../config/config.module";
import { ConfigService } from "../config/config.service";

@Module({
    imports: [
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                uri: configService.databaseUrl,
            }),
            inject: [ConfigService],
        }),
    ],
})
export class DatabaseModule {}