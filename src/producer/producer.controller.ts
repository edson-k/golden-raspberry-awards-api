import { Body, Controller, Get, HttpException, HttpStatus, NotFoundException, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProducerService } from './producer.service';
import { Producer } from './producer.entity';

class AwardInterval {
    producer: string;
    interval: number;
    previousWin: number;
    followingWin: number;
}

class AwardIntervalsResponse {
    min: AwardInterval[];
    max: AwardInterval[];
}

@ApiTags('Producer')
@Controller('producers')
export class ProducerController {
    constructor(private readonly producerService: ProducerService) {}

    @Get('awards-intervals')
    @ApiOperation({
        summary: 'Obter os produtores com menor e maior intervalo entre prêmios',
        description: 'Retorna os produtores com o menor e maior intervalo entre dois prêmios consecutivos do Golden Raspberry Awards.'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista dos produtores com o menor e maior intervalo entre prêmios.',
        type: AwardIntervalsResponse,
        examples: {
            success: {
                summary: 'Exemplo de resposta esperada',
                value: {
                    "min": [
                        {
                            "producer": "Joel Silver",
                            "interval": 1,
                            "previousWin": 1990,
                            "followingWin": 1991
                        }
                    ],
                    "max": [
                        {
                            "producer": "Buzz Feitshans",
                            "interval": 9,
                            "previousWin": 1985,
                            "followingWin": 1994
                        }
                    ]
                }
            }
        }
    })
    @ApiResponse({ status: 404, description: 'Nenhum produtor premiado encontrado.' })
    async getIntervals(): Promise<AwardIntervalsResponse> {
        try {
            const result = await this.producerService.getAwardIntervals();
            if (!result.min.length && !result.max.length) {
                throw new HttpException('Nenhum produtor com prêmios encontrado', HttpStatus.NOT_FOUND);
            }
            return result;
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @Post()
    @ApiOperation({ summary: 'Criar um produtor' })
    @ApiResponse({ status: 201, description: 'Produtor criado com sucesso', type: Producer })
    async create(@Body() producer: Producer): Promise<Producer> {
        if (!producer.name) {
            throw new NotFoundException('Nome do produtor é obrigatório.');
        }
        return this.producerService.create(producer);
    }
}
