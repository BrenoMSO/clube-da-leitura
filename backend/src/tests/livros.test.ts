import request from 'supertest';
import axios from 'axios';
import app from '../server';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Google Books (/api/livros/buscar)', () => {
  let token: string;

  beforeEach(async () => {
    // Registrar e autenticar usuário para obter o token JWT
    await request(app)
      .post('/api/auth/registrar')
      .send({
        nome: 'Leitor Google Books',
        email: 'google.books@exemplo.com',
        senha: 'senhaGoogle123',
      });

    const resLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'google.books@exemplo.com',
        senha: 'senhaGoogle123',
      });
    token = resLogin.body.token;
  });

  it('Deve retornar um array de livros formatado corretamente com mock do axios', async () => {
    // Mock do retorno da API externa do Google Books
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        items: [
          {
            id: 'mock-google-id-999',
            volumeInfo: {
              title: 'Dom Casmurro',
              authors: ['Machado de Assis'],
              imageLinks: {
                thumbnail: 'http://books.google.com/books/content?id=mock-google-id-999&printsec=frontcover',
              },
              pageCount: 256,
            },
          },
        ],
      },
    });

    const res = await request(app)
      .get('/api/livros/buscar?q=Machado')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);

    const livro = res.body[0];
    expect(livro).toEqual({
      googleBookId: 'mock-google-id-999',
      tituloLivro: 'Dom Casmurro',
      autor: 'Machado de Assis',
      capaUrl: 'https://books.google.com/books/content?id=mock-google-id-999&printsec=frontcover',
      totalPaginas: 256,
    });
  });

  it('Deve retornar 400 se o parâmetro q não for fornecido', async () => {
    const res = await request(app)
      .get('/api/livros/buscar')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('mensagem');
  });
});
