import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Producer } from '../producer/producer.entity';

@Entity()
export class Movie {
    @PrimaryGeneratedColumn()
    @ApiProperty({ description: 'Identificador único do filme' })
    id!: number;

    @Column()
    @ApiProperty({ description: 'Título do filme' })
    title: string = '';

    @Column()
    @ApiProperty({ description: 'Ano de lançamento do filme' })
    year: number = 0;

    @Column()
    @ApiProperty({ description: 'Indica se o filme foi vencedor do prêmio Golden Raspberry' })
    winner: boolean = false;

    @ManyToOne(() => Producer, (producer) => producer.movies, { nullable: false, eager: true })
    @JoinColumn({ name: 'producerId' })
    @ApiProperty({ description: 'Produtor responsável pelo filme' })
    producer!: Producer;

    @Column()
    @ApiProperty({ description: 'ID do produtor associado ao filme' })
    producerId!: number;
}