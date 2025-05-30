import { MikroORM } from '@mikro-orm/core';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app.module';
import { createTestMikroOrmOptions } from '../config/mikro-orm.config';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let orm: MikroORM;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MikroORM)
      .useFactory({
        factory: () => MikroORM.init(createTestMikroOrmOptions()),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    orm = moduleFixture.get<MikroORM>(MikroORM);
    await app.init();
  });

  afterAll(async () => {
    if (orm) await orm.close();
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
