import { EntityRepository, Repository } from 'typeorm';
import { Producer } from './producer.entity';

@EntityRepository(Producer)
export class ProducerRepository extends Repository<Producer> {}