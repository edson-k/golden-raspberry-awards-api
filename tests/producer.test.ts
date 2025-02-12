import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync'; 

interface MovieCSV {
    title: string;
    year: number;
    studios: string;
    producers: string;
    winner?: boolean;
}

const loadCsvData = (): MovieCSV[] => {
    const filePath = 'data/movielist.csv';
    const fileContent = readFileSync(filePath, 'utf8');
    return parse(fileContent, { columns: true, skip_empty_lines: true, delimiter: ';' })
        .map((row: any) => ({
            title: row.title.trim(),
            year: Number(row.year),
            studios: row.studios.trim(),
            producers: row.producers.trim(),
            winner: row.winner === 'true' || row.winner === true,
        }));
};

describe('ProducerController', () => {
    let app: INestApplication;
    let csvData: MovieCSV[];

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        csvData = loadCsvData();
    });

    it('/producers/awards-intervals (GET) - Deve garantir que os valores de min e max são consistentes com o CSV', async () => {
        const response = await request(app.getHttpServer()).get('/producers/awards-intervals');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('min');
        expect(response.body).toHaveProperty('max');

        const expectedMin = csvData.some((row) => row.producers.includes("Bo Derek"))
            ? [{ producer: "Joel Silver", interval: 1, previousWin: 1990, followingWin: 1991 }]
            : [];

        const expectedMax = csvData.some((row) => row.producers.includes("Matthew Vaughn"))
            ? [{ producer: "Matthew Vaughn", interval: 13, previousWin: 2002, followingWin: 2015 }]
            : [];

        expect(response.body.min).toEqual(expectedMin);
        expect(response.body.max).toEqual(expectedMax);
    });

    afterAll(async () => {
        await app.close();
    });
});
