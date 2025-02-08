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
            .orderBy('producer.name', 'ASC')
            .addOrderBy('movie.year', 'ASC')
            .select(['producer.name AS producer', 'movie.year AS year'])
            .getRawMany();
    
        if (!producers.length) {
            throw new Error('Nenhum produtor com prêmios encontrado.');
        }
    
        const producerAwardsMap = new Map<string, number[]>();
    
        producers.forEach(({ producer, year }) => {
            const producerNames = producer.split(/,\s*| and /).map((p: string) => p.trim());
    
            producerNames.forEach((name: string) => {
                if (!producerAwardsMap.has(name)) {
                    producerAwardsMap.set(name, []);
                }
                producerAwardsMap.get(name)?.push(year);
            });
        });
    
        const intervals: Interval[] = [];
    
        producerAwardsMap.forEach((years, producer) => {
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
    
        return {
            min: intervals.filter(i => i.interval === minInterval),
            max: intervals.filter(i => i.interval === maxInterval),
        };
    }
    
    async create(producer: Producer): Promise<Producer> {
        console.log('Criando produtor:', producer.name);
        return this.producerRepository.save(producer);
    }
}
