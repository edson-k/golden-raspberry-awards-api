import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './http-exception.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalFilters(new HttpExceptionFilter());

    const config = new DocumentBuilder()
        .setTitle('Golden Raspberry Awards API')
        .setDescription('API para consulta de filmes indicados e vencedores do Golden Raspberry Awards')
        .setVersion('1.0')
        .addTag('Movies', 'Endpoints relacionados a filmes')
        .addTag('Producer', 'Endpoints relacionados a produtores')
        .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('doc', app, document);

    await app.listen(3000);
    console.log('API rodando em http://localhost:3000');
}

bootstrap();
