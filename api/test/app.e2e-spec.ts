import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('HealthController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((response) => {
        expect(response.body).toEqual({
          status: 'ok',
          service: 'statify-backend',
          timestamp: expect.any(String),
        });
      });
  });

  it('/auth/register (POST)', async () => {
    const email = `test_${Date.now()}@example.com`;

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        password: 'secret123',
      })
      .expect(201);

    expect(response.body).toEqual({
      id: expect.any(Number),
      email,
      createdAt: expect.any(String),
    });
    expect(response.body.password).toBeUndefined();

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        password: 'secret123',
      })
      .expect(409)
      .expect((duplicateResponse) => {
        expect(duplicateResponse.body.message).toBe('User already exists');
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
