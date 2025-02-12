import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './movie.entity';
import { Producer } from '../producer/producer.entity';
import * as fs from 'fs';
import csvParser from 'csv-parser';

interface MovieCSV {
    title: string;
    year: string;
    studios: string;
    producers: string;
    winner?: string;
}

@Injectable()
export class MovieService {
    constructor(
        @InjectRepository(Movie)
        private readonly movieRepository: Repository<Movie>,

        @InjectRepository(Producer)
        private readonly producerRepository: Repository<Producer>,
    ) { }

    async findAll(): Promise<Movie[]> {
        console.log('Buscando todos os filmes...');
        return this.movieRepository.find();
    }

    async findOne(id: number): Promise<Movie> {
        console.log(`Buscando um filme com ID ${id}...`);

        const movie = await this.movieRepository.findOne({ where: { id } });

        if (!movie) {
            throw new NotFoundException(`Nenhum filme encontrado com o ID ${id}.`);
        }

        return movie;
    }

    async update(movie: Movie): Promise<{ message: string; updatedMovie?: Movie }> {
        console.log('Atualizando um filme...');
    
        if (!movie.id) {
            throw new Error('ID do filme é obrigatório para atualização.');
        }
    
        const existingMovie = await this.movieRepository.findOne({ where: { id: movie.id } });
        if (!existingMovie) {
            throw new Error(`Nenhum filme encontrado com o ID ${movie.id}.`);
        }
    
        const updatedMovie = {
            ...existingMovie,
            title: movie.title?.trim() || existingMovie.title,
            year: movie.year ? Number(movie.year) : existingMovie.year,
            winner: movie.winner?.toString().toLowerCase() === 'yes',
            producer: typeof movie.producer === 'object' && movie.producer?.name 
                ? { name: movie.producer.name.trim() } 
                : existingMovie.producer,
        };
    
        if (!updatedMovie.title || !updatedMovie.year || !updatedMovie.producer) {
            throw new Error('Título, ano e produtor são obrigatórios.');
        }
    
        const savedMovie = await this.movieRepository.save(updatedMovie);
    
        return {
            message: 'Filme atualizado com sucesso!',
            updatedMovie: savedMovie,
        };
    }
    

    async create(movie: Partial<Movie>): Promise<Movie> {
        console.log('Cadastrando um novo filme...', movie);
    
        if (!movie.producerId) {
            throw new BadRequestException('O campo producerId é obrigatório.');
        }
    
        const producer = await this.producerRepository.findOne({ where: { id: movie.producerId } });
        if (!producer) {
            throw new BadRequestException(`Produtor com ID ${movie.producerId} não encontrado.`);
        }
    
        const newMovie = this.movieRepository.create({
            title: movie.title?.trim(),
            year: Number(movie.year),
            winner: movie.winner,
            producer: producer,
            producerId: producer.id,
        });
    
        return this.movieRepository.save(newMovie);
    }
    
    async insertMovies(movies: MovieCSV[]): Promise<{ inserted: number; ignored: number }> {
        console.log('Validando e inserindo filmes na base de dados...');
    
        let insertedCount = 0;
        let ignoredCount = 0;
    
        for (const movieData of movies) {
            if (!movieData.title || !movieData.year || !movieData.producers) {
                console.warn(`Filme inválido encontrado e será ignorado: ${JSON.stringify(movieData)}`);
                ignoredCount++;
                continue;
            }
    
            const title = String(movieData.title).trim();
            const year = Number(movieData.year);
            const winner = movieData.winner === 'true' || movieData.winner === 'yes';
            const producerNames = String(movieData.producers)
                .replace(/\sand\s/g, ", ")
                .split(/,\s*/)
                .map(name => name.trim());
    
            const producers = [];
            for (const producerName of producerNames) {
                if (!producerName) continue;
    
                let producer = await this.producerRepository.findOne({ where: { name: producerName } });
    
                if (!producer) {
                    producer = this.producerRepository.create({ name: producerName });
                    await this.producerRepository.save(producer);
                }
    
                producers.push(producer);
            }
    
            if (producers.length === 0) {
                console.warn(`Filme ignorado por não ter produtores válidos: ${title}`);
                ignoredCount++;
                continue;
            }
    
            for (const producer of producers) {
                const newMovie = this.movieRepository.create({
                    title,
                    year,
                    winner,
                    producer,
                });
    
                await this.movieRepository.save(newMovie);
                insertedCount++;
            }
        }
    
        console.log(`Filmes inseridos com sucesso: ${insertedCount}`);
        console.log(`Filmes ignorados: ${ignoredCount}`);
        return { inserted: insertedCount, ignored: ignoredCount };
    }    

    async delete(id: number): Promise<void> {
        const movie = await this.movieRepository.findOne({ where: { id } });
    
        if (!movie) {
            throw new NotFoundException(`Filme com ID ${id} não encontrado.`);
        }
    
        await this.movieRepository.remove(movie);
    }

    async importCsv(filePath: string) {
        const movies: MovieCSV[] = [];
        
        return new Promise<{ inserted: number; ignored: number }>((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csvParser({ separator: ';' }))
                .on('data', (row) => {
                    movies.push({
                        year: row.year,
                        title: row.title,
                        studios: row.studios,
                        producers: row.producers,
                        winner: row.winner,
                    });
                })
                .on('end', async () => {
                    const result = await this.insertMovies(movies);
                    resolve(result);
                })
                .on('error', (error) => reject(error));
        });
    }
}