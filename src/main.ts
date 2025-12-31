import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const server = express();
let cachedServer: any;

async function bootstrap() {
  server.use((req, res, next) => {
  res.setHeader(
    'Access-Control-Allow-Origin',
    'https://barcode-front-vercel.vercel.app',
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization',
  );
  next();
});
  if (!cachedServer) {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
    );

    app.enableCors({
      origin: 'https://barcode-front-vercel.vercel.app',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    await app.init();
    cachedServer = server;
  }
  return cachedServer;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  // ✅ CRITICAL: Handle preflight BEFORE NestJS
  if (req.method === 'OPTIONS') {
    res.setHeader(
      'Access-Control-Allow-Origin',
      'https://barcode-front-vercel.vercel.app',
    );
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization',
    );
    res.status(204).end();
    return;
  }

  const app = await bootstrap();
  app(req, res);
}
