import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth/auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectionOptions } from 'typeorm';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public')
    }),
    ConfigModule.forRoot({ 
      envFilePath: `.${process.env.NODE_ENV.trim()}.env`,
      isGlobal: true,
     }),
     MongooseModule.forRootAsync({
      inject:[ConfigService],
      useFactory:()=>({
        uri:process.env.URL_MONGODB
      })
     }),
     TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      async useFactory(config: ConfigService) {
        return {
          type: 'mssql',
          host: config.get('DB_HOST'),
          username: config.get('DB_USERNAME'),
          password: config.get('DB_PASS'),
          port: +config.get('DB_PORT'),
          database: config.get('DB_NAME'),
          autoLoadEntities: true,
          synchronize: false,
          extra: {
            trustServerCertificate: true
          },
        } as ConnectionOptions;
      },
    }),
    ChatModule,
  ],
  controllers: [],
  providers: [AuthService],
})
export class AppModule { }
