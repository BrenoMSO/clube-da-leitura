import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Clube da Leitura',
      version: '1.0.0',
      description:
        'Documentação oficial da API do Clube da Leitura. Sistema de gerenciamento de usuários, grupos de leitura, competição com ranking de páginas lidas e busca de livros via Google Books API.',
    },
    servers: [
      {
        url: process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3000}`,
        description: 'Servidor local da API',
      },
    ],
    tags: [
      {
        name: 'Autenticação',
        description: 'Endpoints para cadastro e autenticação de usuários via JWT',
      },
      {
        name: 'Grupos',
        description: 'Endpoints para criação, entrada e consulta de detalhes e ranking de grupos',
      },
      {
        name: 'Leituras',
        description: 'Endpoints para acompanhamento do progresso de leitura e avaliação de livros',
      },
      {
        name: 'Livros',
        description: 'Endpoints para busca e integração com o catálogo do Google Books',
      },
      {
        name: 'Sistema',
        description: 'Endpoints de monitoramento e verificação do status da API',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Insira o token JWT no cabeçalho de autorização. Formato: Bearer <token>',
        },
      },
      schemas: {
        UsuarioResumo: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '65f1a2b3c4d5e6f7a8b9c0d1',
              description: 'Identificador único do usuário no MongoDB',
            },
            nome: {
              type: 'string',
              example: 'Maria Silva',
              description: 'Nome completo do usuário',
            },
            username: {
              type: 'string',
              example: 'mariasilva',
              description: 'Nome de usuário único',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'maria@email.com',
              description: 'Endereço de e-mail do usuário',
            },
          },
        },
        UsuarioResposta: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '65f1a2b3c4d5e6f7a8b9c0d1',
              description: 'Identificador único do usuário no MongoDB',
            },
            nome: {
              type: 'string',
              example: 'Maria Silva',
              description: 'Nome completo do usuário',
            },
            username: {
              type: 'string',
              example: 'mariasilva',
              description: 'Nome de usuário único',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'maria@email.com',
              description: 'Endereço de e-mail do usuário',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-03-15T12:00:00.000Z',
              description: 'Data de criação da conta',
            },
          },
        },
        Grupo: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '65f1a2b3c4d5e6f7a8b9c0d2',
              description: 'Identificador único do grupo',
            },
            nome: {
              type: 'string',
              example: 'Clube de Ficção Científica',
              description: 'Nome do grupo de leitura',
            },
            descricao: {
              type: 'string',
              example: 'Grupo de leitura focado em clássicos da ficção científica.',
              description: 'Descrição ou regras do grupo',
            },
            codigoConvite: {
              type: 'string',
              example: 'ABC123',
              description: 'Código de convite com 6 caracteres maiúsculos',
            },
            criadorId: {
              $ref: '#/components/schemas/UsuarioResumo',
            },
            membros: {
              type: 'array',
              description: 'Lista de membros do grupo',
              items: {
                $ref: '#/components/schemas/UsuarioResumo',
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-03-15T12:00:00.000Z',
              description: 'Data de criação do grupo',
            },
          },
        },
        Leitura: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '65f1a2b3c4d5e6f7a8b9c0d3',
              description: 'Identificador único da leitura',
            },
            usuarioId: {
              type: 'string',
              example: '65f1a2b3c4d5e6f7a8b9c0d1',
              description: 'ID do usuário dono da leitura',
            },
            grupoId: {
              type: 'string',
              example: '65f1a2b3c4d5e6f7a8b9c0d2',
              description: 'ID do grupo associado',
            },
            googleBookId: {
              type: 'string',
              example: 'zyTCAlFPjgYC',
              description: 'Identificador do livro na API Google Books (se houver)',
            },
            tituloLivro: {
              type: 'string',
              example: 'Duna',
              description: 'Título do livro',
            },
            autor: {
              type: 'string',
              example: 'Frank Herbert',
              description: 'Autor(es) da obra',
            },
            capaUrl: {
              type: 'string',
              example: 'https://books.google.com/books/content?id=zyTCAlFPjgYC&printsec=frontcover&img=1',
              description: 'URL da capa do livro',
            },
            totalPaginas: {
              type: 'integer',
              example: 680,
              description: 'Número total de páginas do livro',
            },
            paginasLidas: {
              type: 'integer',
              example: 340,
              description: 'Quantidade de páginas já lidas',
            },
            concluido: {
              type: 'boolean',
              example: false,
              description: 'Indica se a leitura do livro foi concluída (100%)',
            },
            avaliacao: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              example: 5,
              description: 'Nota de avaliação de 1 a 5 estrelas (apenas se concluído)',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-03-15T12:00:00.000Z',
              description: 'Data de registro da leitura',
            },
          },
        },
        RankingItem: {
          type: 'object',
          properties: {
            posicao: {
              type: 'integer',
              example: 1,
              description: 'Classificação do participante no grupo',
            },
            usuarioId: {
              type: 'string',
              example: '65f1a2b3c4d5e6f7a8b9c0d1',
              description: 'Identificador do usuário',
            },
            nome: {
              type: 'string',
              example: 'Maria Silva',
              description: 'Nome do participante',
            },
            username: {
              type: 'string',
              example: 'mariasilva',
              description: 'Nome de usuário',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'maria@email.com',
              description: 'Email do participante',
            },
            pontos: {
              type: 'integer',
              example: 350,
              description: 'Pontuação total no grupo (soma das páginas lidas)',
            },
            totalLivros: {
              type: 'integer',
              example: 2,
              description: 'Total de livros registrados no grupo',
            },
          },
        },
        LivroGoogleBooks: {
          type: 'object',
          properties: {
            googleBookId: {
              type: 'string',
              example: 'zyTCAlFPjgYC',
              description: 'ID de volume do Google Books',
            },
            tituloLivro: {
              type: 'string',
              example: 'Duna',
              description: 'Título do livro',
            },
            autor: {
              type: 'string',
              example: 'Frank Herbert',
              description: 'Autor ou autores do livro',
            },
            capaUrl: {
              type: 'string',
              example: 'https://books.google.com/books/content?id=zyTCAlFPjgYC&printsec=frontcover&img=1',
              description: 'URL com protocolo seguro da imagem da capa',
            },
            totalPaginas: {
              type: 'integer',
              example: 680,
              description: 'Quantidade de páginas catalogadas',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            mensagem: {
              type: 'string',
              example: 'Mensagem de erro explicativa.',
            },
            detalhes: {
              type: 'string',
              example: 'Detalhes adicionais sobre o erro interno (opcional).',
            },
          },
        },
      },
    },
  },
  apis: [
    path.join(__dirname, '../routes/*.ts'),
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../server.ts'),
    path.join(__dirname, '../server.js'),
    './src/routes/*.ts',
    './src/server.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
