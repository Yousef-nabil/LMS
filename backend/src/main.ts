import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as cookieParser from 'cookie-parser';


dotenv.config();
dotenv.config({ path: '.env.local', override: true });

async function bootstrap() {
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  app.use(cookieParser.default());
  //app.use()
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
