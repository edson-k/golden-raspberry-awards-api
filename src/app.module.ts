import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { MovieModule } from './movie/movie.module';
import { ProducerModule } from './producer/producer.module';
import { Movie } from './movie/movie.entity';
import { Producer } from './producer/producer.entity';
import { MovieService } from './movie/movie.service';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'sqlite',
            database: ':memory:',
            entities: [Movie, Producer],
            synchronize: true,
        }),
        MulterModule.register({
            dest: './uploads', // Diretório para salvar os arquivos CSV temporariamente
        }),
        MovieModule,
        ProducerModule,
    ],
})
export class AppModule implements OnModuleInit {
    constructor(
        private readonly movieService: MovieService,
    ) { }

    async onModuleInit() {
        console.log('Iniciando carregamento dos dados do CSV...');
        const filePath = 'data/movielist.csv';
        try {
            const fileContent = readFileSync(filePath, 'utf8');
            const records = parse(fileContent, { columns: true, skip_empty_lines: true, delimiter: ';' });
            await this.movieService.insertMovies(records);
            console.log('Dados do CSV carregados com sucesso!');
        } catch (error) {
            console.error('Erro ao carregar CSV:', error);
        }
    }
}
