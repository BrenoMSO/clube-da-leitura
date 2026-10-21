import request from 'supertest';
import app from '../server';

describe('Autenticação (/api/auth)', () => {
  const usuarioMock = {
    nome: 'Leitor Teste',
    email: 'leitor.teste@exemplo.com',
    senha: 'senhaSegura123',
  };

  it('Deve registar um novo utilizador com sucesso (retorna 201)', async () => {
    const res = await request(app)
      .post('/api/auth/registrar')
      .send(usuarioMock);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('mensagem', 'Usuário cadastrado com sucesso!');
    expect(res.body).toHaveProperty('usuario');
    expect(res.body.usuario).toHaveProperty('id');
    expect(res.body.usuario.nome).toBe(usuarioMock.nome);
    expect(res.body.usuario.email).toBe(usuarioMock.email);
    expect(res.body.usuario).not.toHaveProperty('senha');
  });

  it('Não deve permitir registo com e-mail duplicado (retorna 400)', async () => {
    // Primeiro registo
    await request(app)
      .post('/api/auth/registrar')
      .send(usuarioMock);

    // Tentativa de duplicado
    const res = await request(app)
      .post('/api/auth/registrar')
      .send(usuarioMock);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('mensagem');
    expect(res.body.mensagem).toMatch(/já existe/i);
  });

  it('Deve fazer login e retornar um token JWT válido (retorna 200)', async () => {
    // Registar usuário previamente
    await request(app)
      .post('/api/auth/registrar')
      .send(usuarioMock);

    // Efetuar login
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: usuarioMock.email,
        senha: usuarioMock.senha,
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
    expect(res.body).toHaveProperty('usuario');
    expect(res.body.usuario.email).toBe(usuarioMock.email);
  });

  it('Não deve fazer login com senha incorreta (retorna 401)', async () => {
    await request(app)
      .post('/api/auth/registrar')
      .send(usuarioMock);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: usuarioMock.email,
        senha: 'senhaErrada',
      });

    expect(res.status).toBe(401);
  });
});
