import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('ProducerController', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/producers/awards-intervals (GET) - Deve retornar os produtores com maior e menor intervalo entre prêmios', async () => {
        const response = await request(app.getHttpServer()).get('/producers/awards-intervals');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('min');
        expect(response.body).toHaveProperty('max');

        expect(Array.isArray(response.body.min)).toBe(true);
        expect(Array.isArray(response.body.max)).toBe(true);
    });

    afterAll(async () => {
        await app.close();
    });
});
