import request from 'supertest';
import app from '../server';

describe('Grupos (/api/grupos)', () => {
  let tokenUsuario1: string;
  let tokenUsuario2: string;

  beforeEach(async () => {
    // Registrar e autenticar Usuário 1
    const resReg1 = await request(app)
      .post('/api/auth/registrar')
      .send({
        nome: 'Criador Grupo',
        email: 'criador@exemplo.com',
        senha: 'senhaCriador123',
      });
    const resLogin1 = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'criador@exemplo.com',
        senha: 'senhaCriador123',
      });
    tokenUsuario1 = resLogin1.body.token;

    // Registrar e autenticar Usuário 2
    await request(app)
      .post('/api/auth/registrar')
      .send({
        nome: 'Membro Grupo',
        email: 'membro@exemplo.com',
        senha: 'senhaMembro123',
      });
    const resLogin2 = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'membro@exemplo.com',
        senha: 'senhaMembro123',
      });
    tokenUsuario2 = resLogin2.body.token;
  });

  it('Deve criar um grupo e gerar um código de 6 caracteres (retorna 201)', async () => {
    const res = await request(app)
      .post('/api/grupos')
      .set('Authorization', `Bearer ${tokenUsuario1}`)
      .send({
        nome: 'Clube dos Clássicos',
        descricao: 'Leitura de literatura clássica',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('grupo');
    expect(res.body.grupo).toHaveProperty('codigoConvite');
    expect(res.body.grupo.codigoConvite).toHaveLength(6);
    expect(res.body.grupo.nome).toBe('Clube dos Clássicos');
  });

  it('Deve permitir que um utilizador entre num grupo via código (retorna 200)', async () => {
    // Criar grupo com Usuário 1
    const resCriar = await request(app)
      .post('/api/grupos')
      .set('Authorization', `Bearer ${tokenUsuario1}`)
      .send({
        nome: 'Clube de Ficção Científica',
      });
    const codigoConvite = resCriar.body.grupo.codigoConvite;

    // Usuário 2 entra usando o código de convite
    const resEntrar = await request(app)
      .post('/api/grupos/entrar')
      .set('Authorization', `Bearer ${tokenUsuario2}`)
      .send({ codigoConvite });

    expect(resEntrar.status).toBe(200);
    expect(resEntrar.body).toHaveProperty('grupo');
    expect(resEntrar.body.grupo.membros).toHaveLength(2);
  });
});
