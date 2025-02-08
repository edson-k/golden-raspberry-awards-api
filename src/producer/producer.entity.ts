import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Movie } from '../movie/movie.entity';

@Entity()
export class Producer {
    @PrimaryGeneratedColumn()
    @ApiProperty({ description: 'Identificador único do produtor' })
    id!: number;

    @Column()
    @ApiProperty({ description: 'Nome do produtor' })
    name: string = '';

    @OneToMany(() => Movie, movie => movie.producer)
    movies!: Movie[];
}
