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

    it('/producers/awards-intervals (GET) - Deve garantir que os valores de min e max são consistentes', async () => {
        const response = await request(app.getHttpServer()).get('/producers/awards-intervals');
        
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            min: [{ producer: "Joel Silver", interval: 1, previousWin: 1990, followingWin: 1991 }],
            max: [{ producer: "Matthew Vaughn", interval: 13, previousWin: 2002, followingWin: 2015 }]
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
