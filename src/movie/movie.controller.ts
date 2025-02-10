import { 
    BadRequestException, 
    Body, 
    Controller, 
    Delete, 
    Get, 
    NotFoundException, 
    Param, 
    Post, 
    Put, 
    UploadedFile, 
    UseInterceptors 
} from '@nestjs/common';
import * as path from 'path';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MovieService } from './movie.service';
import { Movie } from './movie.entity';

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

    @Post('import-csv')
    @ApiOperation({ summary: 'Importar filmes via CSV', description: 'Importa uma lista de filmes a partir de um arquivo CSV enviado pelo usuário.' })
    @ApiResponse({ status: 201, description: 'Filmes importados com sucesso' })
    @ApiResponse({ status: 400, description: 'Erro ao processar o arquivo' })
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads',
                filename: (_req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    cb(null, `${uniqueSuffix}-${file.originalname}`);
                },
            }),
            fileFilter: (_req, file, cb) => {
                if (!file.originalname.match(/\.(csv)$/)) {
                    return cb(new BadRequestException('Somente arquivos CSV são permitidos'), false);
                }
                cb(null, true);
            },
        }),
    )
    async importCsv(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('Arquivo CSV é obrigatório.');
        }

        const filePath = path.resolve(file.path);
        const result = await this.movieService.importCsv(filePath);
        return { message: 'Importação concluída.', ...result };
    }
}