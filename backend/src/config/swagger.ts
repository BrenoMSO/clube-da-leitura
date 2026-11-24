import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Clube da Leitura',
      version: '1.0.0',
      description: 'Documentação da API para gerenciamento de usuários, grupos, leituras e busca de livros.',
    },
    servers: [
      {
        url: 'http://localhost:3000', // PORTA ONDE O SERVER T'A CONFFIGURADO
        description: 'Servidor de desenvolvimento',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/models/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);