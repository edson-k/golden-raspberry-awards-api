# **Golden Raspberry API** 🎬🏆

## **Descrição**
API RESTful para consulta dos indicados e vencedores do prêmio **Golden Raspberry Awards**, incluindo informações sobre filmes e produtores.

---

## **📦 Instalação**
Para instalar as dependências do projeto, execute o seguinte comando:

```sh
npm install
```

---

## **🚀 Execução**
Para iniciar o servidor em modo de desenvolvimento:

```sh
npm run dev
```

Para executar no modo de produção:

```sh
npm run build
npm run start
```

---

## **📌 Docker**
Construir a Imagem e rodar
```sh
docker-compose up -d app
```

---

## **🧪 Testes**
Para rodar os testes de integração:

```sh
npm run test
```

---

## **🛠 Tecnologias Utilizadas**
- **NestJS** - Framework utilizado para a API
- **TypeORM** - ORM para interação com o banco de dados
- **SQLite (em memória)** - Banco de dados temporário para armazenamento das informações
- **Swagger** - Documentação interativa da API
- **Jest** - Testes automatizados de integração
- **Supertest** - Utilizado para testar os endpoints da API

---

## **📌 Endpoints Disponíveis**

### **🎬 Filmes**
| Método | Rota          | Descrição                          |
|--------|--------------|----------------------------------|
| **GET** | `/movies`     | Retorna todos os filmes cadastrados |
| **GET** | `/movies/{id}` | Retorna um filme específico por ID |
| **POST** | `/movies` | Cadastra um novo filme |
| **PUT** | `/movies/{id}` | Atualiza um filme existente por ID |
| **DELETE** | `/movies/{id}` | Remove um filme por ID |

### **🎭 Produtores**
| Método | Rota                               | Descrição |
|--------|-----------------------------------|-----------|
| **GET** | `/producers/awards-intervals`     | Retorna os produtores com **maior e menor** intervalo entre prêmios |
| **POST** | `/producers` | Cadastra um novo produtor |

---

## **🗄 Estrutura do Banco de Dados**
A API utiliza um banco de dados **SQLite em memória**, que é inicializado e populado automaticamente ao iniciar a aplicação. O esquema do banco contém as seguintes tabelas:

- **Movies** (`id`, `title`, `year`, `winner`, `producerId`)
- **Producers** (`id`, `name`)

---

## **📖 Swagger - Documentação da API**
A API conta com uma interface interativa para testes via **Swagger**, acessível no seguinte endereço:

```
http://localhost:3000/doc
```

---

## **📌 Como Funciona a Importação de Dados?**
1. Ao iniciar a aplicação, os dados do **arquivo CSV** são automaticamente lidos e armazenados no banco de dados em memória.
2. Os dados são validados antes da inserção.
3. Filmes inválidos ou duplicados são ignorados e uma mensagem é exibida no console.

---

## **📌 Testes de Integração**
- Testes são realizados para validar a resposta correta dos endpoints.
- Os testes garantem que os dados retornados correspondem ao arquivo de entrada.

---

## **📜 Licença**
Este projeto está licenciado sob a **MIT License**. 

---