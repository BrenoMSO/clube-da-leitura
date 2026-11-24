import request from 'supertest';
import app from '../server';
import { swaggerSpec } from '../config/swagger';

describe('Swagger Documentation (/api-docs)', () => {
  it('Deve expor a especificação OpenAPI em /api-docs.json', async () => {
    const res = await request(app).get('/api-docs.json');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('openapi', '3.0.0');
    expect(res.body.info).toHaveProperty('title', 'API Clube da Leitura');
    expect(res.body).toHaveProperty('paths');

    const paths = Object.keys(res.body.paths);
    expect(paths).toContain('/api/auth/registrar');
    expect(paths).toContain('/api/auth/login');
    expect(paths).toContain('/api/grupos');
    expect(paths).toContain('/api/grupos/entrar');
    expect(paths).toContain('/api/grupos/{grupoId}/detalhes');
    expect(paths).toContain('/api/grupos/{grupoId}/leituras');
    expect(paths).toContain('/api/leituras/{leituraId}/progresso');
    expect(paths).toContain('/api/leituras/{leituraId}/avaliar');
    expect(paths).toContain('/api/livros/buscar');
    expect(paths).toContain('/api/health');
  });

  it('Deve responder na rota da interface Swagger UI (/api-docs/)', async () => {
    const res = await request(app).get('/api-docs/');
    // Swagger UI pode responder com 200 ou redirect 301
    expect([200, 301]).toContain(res.status);
  });

  it('Deve conter todos os schemas necessários na especificação Swagger', () => {
    const spec = swaggerSpec as Record<string, any>;
    const schemas = spec.components?.schemas || {};
    expect(schemas).toHaveProperty('UsuarioResumo');
    expect(schemas).toHaveProperty('UsuarioResposta');
    expect(schemas).toHaveProperty('Grupo');
    expect(schemas).toHaveProperty('Leitura');
    expect(schemas).toHaveProperty('RankingItem');
    expect(schemas).toHaveProperty('LivroGoogleBooks');
    expect(schemas).toHaveProperty('ErrorResponse');
  });

  it('Deve responder com sucesso na rota de healthcheck documentada', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('timestamp');
  });
});
