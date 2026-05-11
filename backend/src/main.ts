import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SerializationInterceptor } from './common/interceptors/bigint.interceptor';

dotenv.config();
dotenv.config({ path: '.env.local', override: true });
dotenv.config({ path: '.env', override: true });


async function bootstrap() {
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  app.use(cookieParser.default());
  app.useGlobalInterceptors(new SerializationInterceptor());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
