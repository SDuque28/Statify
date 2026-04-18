import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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

  it('/auth/login (POST)', async () => {
    const email = `login_${Date.now()}@example.com`;
    const password = 'secret123';
    const jwtService = app.get(JwtService);

    await request(app.getHttpServer()).post('/auth/register').send({
      email,
      password,
    });

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        password,
      })
      .expect(201);

    expect(response.body).toEqual({
      access_token: expect.any(String),
      user: {
        id: expect.any(Number),
        email,
      },
    });
    expect(response.body.user.password).toBeUndefined();

    const payload = await jwtService.verifyAsync(response.body.access_token);

    expect(payload.sub).toBe(response.body.user.id);
    expect(payload.email).toBe(email);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        password: 'wrongpass',
      })
      .expect(401)
      .expect((invalidResponse) => {
        expect(invalidResponse.body.message).toBe('Invalid credentials');
      });
  });

  it('/spotify/login (GET)', async () => {
    await request(app.getHttpServer())
      .get('/spotify/login')
      .expect(302)
      .expect((response) => {
        expect(response.headers.location).toContain(
          'https://accounts.spotify.com/authorize?',
        );
        expect(response.headers.location).toContain('response_type=code');
        expect(response.headers.location).toContain('client_id=your_client_id');
        expect(response.headers.location).toContain(
          encodeURIComponent('http://localhost:3000/spotify/callback'),
        );
      });
  });

  it('/spotify/callback (GET) without code', async () => {
    await request(app.getHttpServer())
      .get('/spotify/callback')
      .expect(400)
      .expect((response) => {
        expect(response.body.message).toBe('Missing Spotify authorization code');
      });
  });

  it('/spotify/top-artists (GET) without token', async () => {
    await request(app.getHttpServer())
      .get('/spotify/top-artists')
      .expect(401);
  });

  it('/spotify/top-artists (GET) with invalid token', async () => {
    await request(app.getHttpServer())
      .get('/spotify/top-artists')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });

  it('/spotify/top-artists (GET) with valid token but no Spotify connection', async () => {
    const email = `spotify_${Date.now()}@example.com`;
    const password = 'secret123';

    await request(app.getHttpServer()).post('/auth/register').send({
      email,
      password,
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        password,
      })
      .expect(201);

    await request(app.getHttpServer())
      .get('/spotify/top-artists?limit=10&time_range=medium_term')
      .set('Authorization', `Bearer ${loginResponse.body.access_token}`)
      .expect(404)
      .expect((response) => {
        expect(response.body.message).toBe(
          'Spotify account not connected for this user',
        );
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
