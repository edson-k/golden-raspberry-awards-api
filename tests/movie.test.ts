import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection, getConnectionManager } from 'typeorm';

describe('MovieController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    beforeEach(async () => {
        const connectionManager = getConnectionManager();
        if (connectionManager.has('default')) {
            const connection = getConnection();
            if (!connection.isConnected) {
                await connection.connect();
            }
            await connection.synchronize(true);
        }
    });

    afterAll(async () => {
        await app.close();
        const connectionManager = getConnectionManager();
        if (connectionManager.has('default')) {
            const connection = getConnection();
            if (connection.isConnected) {
                await connection.close();
            }
        }
    });

    it('/movies (GET) - Deve retornar lista de filmes', async () => {
        const response = await request(app.getHttpServer()).get('/movies');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('/movies (POST) - Deve falhar ao criar um filme sem producerId', async () => {
        const newMovie = {
            title: 'Filme Sem Produtor',
            year: 2025,
            winner: true
        };

        const response = await request(app.getHttpServer())
            .post('/movies')
            .send(newMovie);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('O campo producerId é obrigatório.');
    });

    it('/movies (POST) - Deve criar um novo filme com um producerId válido', async () => {
        const producerResponse = await request(app.getHttpServer())
            .post('/producers')
            .send({ name: 'Produtor Teste' });

        expect(producerResponse.status).toBe(201);
        expect(producerResponse.body).toHaveProperty('id');

        const producerId = producerResponse.body.id;

        const newMovie = {
            title: 'Novo Filme de Teste',
            year: 2025,
            producerId,
            winner: true
        };

        const response = await request(app.getHttpServer())
            .post('/movies')
            .send(newMovie);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe(newMovie.title);
        expect(response.body.year).toBe(newMovie.year);
        expect(response.body.winner).toBe(newMovie.winner);
        expect(response.body.producerId).toBe(producerId);
    });

    it('/movies/:id (GET) - Deve retornar 404 para um filme inexistente', async () => {
        const response = await request(app.getHttpServer()).get('/movies/99999');
        expect(response.status).toBe(404);
        expect(response.body.message).toBeDefined();
    });

    it('/movies/:id (DELETE) - Deve deletar um filme existente', async () => {
        const producerResponse = await request(app.getHttpServer())
            .post('/producers')
            .send({ name: 'Produtor Teste' });
        
        expect(producerResponse.status).toBe(201);
        const producerId = producerResponse.body.id;

        const movieResponse = await request(app.getHttpServer())
            .post('/movies')
            .send({ title: 'Filme Teste', year: 2025, producerId, winner: false });
        
        expect(movieResponse.status).toBe(201);
        const movieId = movieResponse.body.id;

        const deleteResponse = await request(app.getHttpServer()).delete(`/movies/${movieId}`);
        expect(deleteResponse.status).toBe(200);
        expect(deleteResponse.body.message).toBe(`Filme com ID ${movieId} deletado com sucesso.`);
    });

    it('/producers/awards-intervals (GET) - Deve retornar os produtores com maior e menor intervalo entre prêmios', async () => {
        const response = await request(app.getHttpServer()).get('/producers/awards-intervals');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('min');
        expect(response.body).toHaveProperty('max');
        expect(Array.isArray(response.body.min)).toBe(true);
        expect(Array.isArray(response.body.max)).toBe(true);
    });
});
