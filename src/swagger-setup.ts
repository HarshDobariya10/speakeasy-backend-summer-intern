import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { execSync } from 'child_process';
const basicAuth = require('express-basic-auth');

const getBranchName = (): string => {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', {
      encoding: 'utf8',
      cwd: process.cwd(),
    }).trim();
  } catch (error: any) {
    console.warn('Could not get git branch name:', error.message);
    return 'unknown';
  }
};

export const setupSwagger = (app: INestApplication) => {
  const swaggerPassword = app.get(ConfigService).get('SWAGGER_PASSWORD');

  app.use(
    ['/api'],
    basicAuth({
      challenge: true,
      users: { admin: swaggerPassword },
    }),
  );

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle(`Speakeasy POS API: ${getBranchName()}`)
    .setDescription('The Speakeasy POS API documentation')
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customCss: '.swagger-ui { background: #E6F3FF; }',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
};
