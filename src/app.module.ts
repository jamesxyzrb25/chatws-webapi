import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth/auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';


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
    ChatModule,
  ],
  controllers: [],
  providers: [AuthService],
})
export class AppModule { }
