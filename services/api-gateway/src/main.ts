import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { randomUUID } from 'crypto';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'Accept',
      'Origin',
      'X-Requested-With'
    ],
    credentials: true,
  });

  const port = process.env.PORT || 3000;

  app.use((req, res, next) => {
  const correlationId =
    (req.headers['x-correlation-id'] as string) || randomUUID();

  req.headers['x-correlation-id'] = correlationId;
  res.setHeader('x-correlation-id', correlationId);

  next();
});


  await app.listen(port, '0.0.0.0');
  console.log(`API Gateway running on port ${port}`);
}
bootstrap();