import request from 'supertest';
import app from '../server';

describe('Leituras e Progresso (/api/leituras)', () => {
  let token: string;
  let grupoId: string;

  beforeEach(async () => {
    // Registrar e autenticar usuário
    await request(app)
      .post('/api/auth/registrar')
      .send({
        nome: 'Leitor Voraz',
        email: 'leitor.voraz@exemplo.com',
        senha: 'senhaLeitor123',
      });

    const resLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'leitor.voraz@exemplo.com',
        senha: 'senhaLeitor123',
      });
    token = resLogin.body.token;

    // Criar um grupo
    const resGrupo = await request(app)
      .post('/api/grupos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nome: 'Grupo de Fantasia',
      });
    grupoId = resGrupo.body.grupo._id;
  });

  it('Deve adicionar um livro ao grupo corretamente', async () => {
    const res = await request(app)
      .post(`/api/grupos/${grupoId}/leituras`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        googleBookId: 'google-id-123',
        tituloLivro: 'O Senhor dos Anéis',
        autor: 'J.R.R. Tolkien',
        capaUrl: 'https://exemplo.com/capa.jpg',
        totalPaginas: 400,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('leitura');
    expect(res.body.leitura.tituloLivro).toBe('O Senhor dos Anéis');
    expect(res.body.leitura.totalPaginas).toBe(400);
    expect(res.body.leitura.paginasLidas).toBe(0);
    expect(res.body.leitura.concluido).toBe(false);
  });

  it('Deve atualizar as páginas lidas e calcular o concluido: true se atingir o total de páginas', async () => {
    // Adicionar livro de 200 páginas
    const resAdd = await request(app)
      .post(`/api/grupos/${grupoId}/leituras`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        tituloLivro: 'O Pequeno Príncipe',
        autor: 'Antoine de Saint-Exupéry',
        totalPaginas: 200,
      });
    const leituraId = resAdd.body.leitura._id;

    // Atualizar para 100 páginas (incompleto)
    const resProg1 = await request(app)
      .patch(`/api/leituras/${leituraId}/progresso`)
      .set('Authorization', `Bearer ${token}`)
      .send({ paginasLidas: 100 });

    expect(resProg1.status).toBe(200);
    expect(resProg1.body.leitura.paginasLidas).toBe(100);
    expect(resProg1.body.leitura.concluido).toBe(false);

    // Atualizar para 200 páginas (completo -> concluido: true)
    const resProg2 = await request(app)
      .patch(`/api/leituras/${leituraId}/progresso`)
      .set('Authorization', `Bearer ${token}`)
      .send({ paginasLidas: 200 });

    expect(resProg2.status).toBe(200);
    expect(resProg2.body.leitura.paginasLidas).toBe(200);
    expect(resProg2.body.leitura.concluido).toBe(true);
  });

  it('Deve bloquear notas (avaliação) se o livro não estiver concluído', async () => {
    // Adicionar livro de 300 páginas
    const resAdd = await request(app)
      .post(`/api/grupos/${grupoId}/leituras`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        tituloLivro: '1984',
        autor: 'George Orwell',
        totalPaginas: 300,
      });
    const leituraId = resAdd.body.leitura._id;

    // Ler apenas 150 páginas
    await request(app)
      .patch(`/api/leituras/${leituraId}/progresso`)
      .set('Authorization', `Bearer ${token}`)
      .send({ paginasLidas: 150 });

    // Tentar avaliar livro não concluído
    const resAvaliar = await request(app)
      .patch(`/api/leituras/${leituraId}/avaliar`)
      .set('Authorization', `Bearer ${token}`)
      .send({ avaliacao: 5 });

    expect(resAvaliar.status).toBe(400);
    expect(resAvaliar.body.mensagem).toMatch(/concluída/i);

    // Concluir a leitura (300 de 300)
    await request(app)
      .patch(`/api/leituras/${leituraId}/progresso`)
      .set('Authorization', `Bearer ${token}`)
      .send({ paginasLidas: 300 });

    // Agora avaliar deve funcionar (retorna 200)
    const resAvaliarSucesso = await request(app)
      .patch(`/api/leituras/${leituraId}/avaliar`)
      .set('Authorization', `Bearer ${token}`)
      .send({ avaliacao: 5 });

    expect(resAvaliarSucesso.status).toBe(200);
    expect(resAvaliarSucesso.body.leitura.avaliacao).toBe(5);
  });
});
