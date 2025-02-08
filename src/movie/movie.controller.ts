import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Post, Put } from '@nestjs/common';
import { MovieService } from './movie.service';
import { Movie } from './movie.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Movies')
@Controller('movies')
export class MovieController {
    constructor(private readonly movieService: MovieService) { }

    @Get()
    @ApiOperation({ summary: 'Listar todos os filmes', description: 'Retorna uma lista de todos os filmes cadastrados no banco de dados.' })
    @ApiResponse({ status: 200, description: 'Lista de filmes retornada com sucesso', type: [Movie] })
    async findAll(): Promise<Movie[]> {
        return this.movieService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar um filme', description: 'Retorna um filme cadastrado no banco de dados.' })
    @ApiResponse({ status: 200, description: 'Filme retornado com sucesso', type: Movie })
    async findOne(@Param('id') id: number): Promise<Movie> {
        try{
            return this.movieService.findOne(id);
        } catch (error: any) {
            throw new NotFoundException(error.message);
        }
    }

    @Post()
    @ApiOperation({ summary: 'Cadastrar um filme', description: 'Cadastra um novo filme no banco de dados. O campo `producerId` é obrigatório.' })
    @ApiResponse({
        status: 201,
        description: 'Filme cadastrado com sucesso',
        type: Movie,
        examples: {
            success: {
                summary: 'Exemplo de resposta bem-sucedida',
                value: {
                    id: 1,
                    title: 'Filme Exemplo',
                    year: 2025,
                    producerId: 10,
                    winner: false
                }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Erro de validação, como ausência de producerId' })
    async create(@Body() movie: Movie): Promise<Movie> {
        try {
            return this.movieService.create(movie);
        } catch (error: any) {
            throw new BadRequestException(error.message);
        }
    }


    @Put(':id')
    @ApiOperation({ summary: 'Atualizar um filme', description: 'Atualiza um filme no banco de dados.' })
    @ApiResponse({ status: 200, description: 'Filme atualizado com sucesso', type: Movie })
    async update(@Param('id') id: number, @Body() movie: Movie) {
        try {
            const updatedMovie = await this.movieService.update({ ...movie, id });
            return updatedMovie;
        } catch (error: any) {
            throw new BadRequestException(error.message);
        }
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Deletar um filme', description: 'Remove um filme do banco de dados pelo ID.' })
    @ApiResponse({ status: 200, description: 'Filme deletado com sucesso' })
    @ApiResponse({ status: 404, description: 'Filme não encontrado' })
    async delete(@Param('id') id: number): Promise<{ message: string }> {
        try {
            await this.movieService.delete(id);
            return { message: `Filme com ID ${id} deletado com sucesso.` };
        } catch (error: any) {
            throw new NotFoundException(error.message);
        }
    }
}