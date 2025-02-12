import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producer } from './producer.entity';

interface Interval {
    producer: string;
    interval: number;
    previousWin: number;
    followingWin: number;
}

@Injectable()
export class ProducerService {
    constructor(
        @InjectRepository(Producer)
        private readonly producerRepository: Repository<Producer>,
    ) {}

    async getAwardIntervals() {
        console.log('Calculando os intervalos de prêmios dos produtores...');

        const producers = await this.producerRepository
            .createQueryBuilder('producer')
            .innerJoin('producer.movies', 'movie')
            .where('movie.winner = :winner', { winner: true })
            .orderBy('movie.year', 'ASC')
            .select(['producer.name AS producer', 'movie.year AS year'])
            .getRawMany();

        const producerWins: Record<string, number[]> = {};

        producers.forEach((row) => {
            const producerNames = row.producer
                .replace(/\sand\s/g, ", ")
                .split(/,\s*/)
                .map((name: string) => name.trim());

            producerNames.forEach((name: string) => {
                if (!producerWins[name]) {
                    producerWins[name] = [];
                }
                producerWins[name].push(row.year);
            });
        });

        const intervals: Interval[] = [];

        Object.entries(producerWins).forEach(([producer, years]) => {
            years.sort((a, b) => a - b);
            for (let i = 1; i < years.length; i++) {
                intervals.push({
                    producer,
                    interval: years[i] - years[i - 1],
                    previousWin: years[i - 1],
                    followingWin: years[i],
                });
            }
        });

        if (intervals.length === 0) {
            return { min: [], max: [] };
        }

        const minInterval = Math.min(...intervals.map(i => i.interval));
        const maxInterval = Math.max(...intervals.map(i => i.interval));

        const minProducers = intervals.filter(i => i.interval === minInterval);
        const maxProducers = intervals.filter(i => i.interval === maxInterval);

        return {
            min: minProducers,
            max: maxProducers,
        };
    }
    
    async create(producer: Producer): Promise<Producer> {
        console.log('Criando produtor:', producer.name);
        return this.producerRepository.save(producer);
    }
}
