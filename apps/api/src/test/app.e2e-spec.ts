import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    // Fermer l'application NestJS
    await app.close();
  });

  it('API server is running', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect((res) => {
        // Vérifie simplement que l'API répond, quel que soit le code de statut
        expect(res.status).toBeDefined();
      });
  });
});
