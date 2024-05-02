import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const TENANT_CONNECTION = 'TENANT_CONNECTION';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if(process.env.NODE_ENV.trim()=='dev'){
    console.log(`Mi env es ${process.env.NODE_ENV.trim()}`);
  }else{
    console.log(`Mi env es ${process.env.NODE_ENV.trim()}`);
  }
  
  const config = new DocumentBuilder()
    .setTitle('Chat Scoket Api')
    .setDescription('The chat socket api')
    .setVersion('1.0')
    .addTag('chat')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  app.enableCors(); // Pasando un objeto vacío

  await app.listen(3000);
}
bootstrap();
