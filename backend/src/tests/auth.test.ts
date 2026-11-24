import request from 'supertest';
import app from '../server';

describe('Autenticação (/api/auth)', () => {
  const usuarioMock = {
    nome: 'Leitor Teste',
    username: 'leitorteste',
    email: 'leitor.teste@exemplo.com',
    senha: 'senhaSegura123',
  };

  it('Deve registrar um novo utilizador com sucesso (retorna 201)', async () => {
    const res = await request(app)
      .post('/api/auth/registrar')
      .send(usuarioMock);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('mensagem', 'Usuário cadastrado com sucesso!');
    expect(res.body).toHaveProperty('usuario');
    expect(res.body.usuario).toHaveProperty('id');
    expect(res.body.usuario.nome).toBe(usuarioMock.nome);
    expect(res.body.usuario.username).toBe(usuarioMock.username);
    expect(res.body.usuario.email).toBe(usuarioMock.email);
    expect(res.body.usuario).not.toHaveProperty('senha');
  });

  it('Não deve permitir registro sem nome, username, email ou senha (retorna 400)', async () => {
    const res = await request(app)
      .post('/api/auth/registrar')
      .send({
        nome: 'Sem Dados',
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('mensagem');
    expect(res.body.mensagem).toMatch(/obrigatórios/i);
  });

  it('Não deve permitir registro com e-mail inválido (retorna 400)', async () => {
    const res = await request(app)
      .post('/api/auth/registrar')
      .send({
        ...usuarioMock,
        email: 'email-invalido',
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('mensagem');
    expect(res.body.mensagem).toMatch(/email válido/i);
  });

  it('Não deve permitir registro com username inválido (retorna 400)', async () => {
    const res = await request(app)
      .post('/api/auth/registrar')
      .send({
        ...usuarioMock,
        username: 'u',
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('mensagem');
    expect(res.body.mensagem).toMatch(/pelo menos 2 caracteres/i);
  });

  it('Não deve permitir registo com e-mail duplicado (retorna 400)', async () => {
    // Primeiro registo
    await request(app)
      .post('/api/auth/registrar')
      .send(usuarioMock);

    // Tentativa de duplicado com mesmo email mas username diferente
    const res = await request(app)
      .post('/api/auth/registrar')
      .send({
        ...usuarioMock,
        username: 'outro_username',
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('mensagem');
    expect(res.body.mensagem).toMatch(/já existe/i);
  });

  it('Não deve permitir registo com username duplicado (retorna 400)', async () => {
    // Primeiro registo
    await request(app)
      .post('/api/auth/registrar')
      .send(usuarioMock);

    // Tentativa de duplicado com mesmo username mas email diferente
    const res = await request(app)
      .post('/api/auth/registrar')
      .send({
        ...usuarioMock,
        email: 'outro.email@exemplo.com',
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('mensagem');
    expect(res.body.mensagem).toMatch(/já existe/i);
  });

  it('Não deve permitir registo com username duplicado com caixa diferente (case-insensitive) (retorna 400)', async () => {
    await request(app)
      .post('/api/auth/registrar')
      .send(usuarioMock);

    const res = await request(app)
      .post('/api/auth/registrar')
      .send({
        ...usuarioMock,
        username: 'LEITORTESTE',
        email: 'novo.email@exemplo.com',
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('mensagem');
    expect(res.body.mensagem).toMatch(/já existe/i);
  });

  it('Deve fazer login usando o e-mail e retornar um token JWT válido (retorna 200)', async () => {
    await request(app)
      .post('/api/auth/registrar')
      .send(usuarioMock);

    // Efetuar login via identificador (email)
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identificador: usuarioMock.email,
        senha: usuarioMock.senha,
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
    expect(res.body).toHaveProperty('usuario');
    expect(res.body.usuario.email).toBe(usuarioMock.email);
    expect(res.body.usuario.username).toBe(usuarioMock.username);
  });

  it('Deve fazer login usando o username e retornar um token JWT válido (retorna 200)', async () => {
    await request(app)
      .post('/api/auth/registrar')
      .send(usuarioMock);

    // Efetuar login via identificador (username)
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identificador: usuarioMock.username,
        senha: usuarioMock.senha,
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
    expect(res.body).toHaveProperty('usuario');
    expect(res.body.usuario.username).toBe(usuarioMock.username);
  });

  it('Deve fazer login usando username com variação de maiúsculas/minúsculas (retorna 200)', async () => {
    await request(app)
      .post('/api/auth/registrar')
      .send(usuarioMock);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identificador: 'LeItOrTeStE',
        senha: usuarioMock.senha,
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.usuario.username).toBe(usuarioMock.username);
  });

  it('Deve manter compatibilidade com payload de login com chave "email" (retorna 200)', async () => {
    await request(app)
      .post('/api/auth/registrar')
      .send(usuarioMock);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: usuarioMock.email,
        senha: usuarioMock.senha,
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('Não deve fazer login com senha incorreta (retorna 401)', async () => {
    await request(app)
      .post('/api/auth/registrar')
      .send(usuarioMock);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identificador: usuarioMock.username,
        senha: 'senhaErrada',
      });

    expect(res.status).toBe(401);
    expect(res.body.mensagem).toBe('Credenciais incorretas.');
  });

  it('Não deve fazer login com usuário inexistente (retorna 401)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identificador: 'nao_existe',
        senha: 'senhaQualquer123',
      });

    expect(res.status).toBe(401);
    expect(res.body.mensagem).toBe('Credenciais incorretas.');
  });
});
