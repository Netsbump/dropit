import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import * as express from 'express';
import { AppModule } from './app.module';
import { config } from './config/env.config';
import { openApiDocument } from './config/swagger.config';

dotenv.config();

const PREFIX = '/api';
const PORT = process.env.API_PORT || 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  // Conditional middleware for better auth
  app.use(
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      // If is routes of better auth, next
      if (req.originalUrl.startsWith(`${PREFIX}/auth`)) {
        console.log('Better Auth route detected:', req.originalUrl);
        return next();
      }
      // Else, apply the express json middleware
      express.json()(req, res, next);
    }
  );

  app.enableCors({
    origin: config.betterAuth.trustedOrigins,
    credentials: true,
  });

  app.setGlobalPrefix(PREFIX);

  // Configuration Swagger
  SwaggerModule.setup('api', app, openApiDocument);

  await app.listen(PORT);
  console.log(`Application is running on: http://localhost:${PORT}`);
}

bootstrap();
