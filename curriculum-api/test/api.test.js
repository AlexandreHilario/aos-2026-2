import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { createApp } from '../src/app.js';
import { HttpError } from '../src/store.js';

class MemoryStore {
  rows = new Map();
  table(entity) { if (!this.rows.has(entity)) this.rows.set(entity, new Map()); return this.rows.get(entity); }
  async get(entity, id) { const row = this.table(entity).get(id); if (!row) throw new HttpError(404, 'Registro não encontrado.'); return structuredClone(row); }
  async list(entity, where = {}, { limit = 100, skip = 0 } = {}) {
    return [...this.table(entity).values()].filter(row => Object.entries(where).every(([key, value]) => JSON.stringify(row[key]) === JSON.stringify(value))).slice(skip, skip + limit).map(row => structuredClone(row));
  }
  async create(entity, body) { const row = { ...body, objectId: randomUUID() }; this.table(entity).set(row.objectId, row); return row; }
  async update(entity, id, body) { const row = { ...await this.get(entity, id), ...body }; this.table(entity).set(id, row); return row; }
  async delete(entity, id) { this.table(entity).delete(id); }
}

test('CRUD HTTP, validações e integridade dos relacionamentos', async t => {
  process.env.API_WRITE_KEY = 'test-key';
  const server = createApp(new MemoryStore()).listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  async function call(method, path, body, expected, key = 'test-key') {
    const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', 'x-api-key': key }, ...(body ? { body: JSON.stringify(body) } : {}) });
    const data = response.status === 204 ? null : await response.json();
    assert.equal(response.status, expected, JSON.stringify(data));
    return data;
  }
  await call('POST', '/pessoas', { nome: 'Ana', email: 'ana@example.com' }, 401, 'wrong');
  await call('POST', '/pessoas', { nome: 'Ana' }, 400);
  await call('POST', '/pessoas', { nome: 'Ana', email: 'inválido' }, 400);
  const person = await call('POST', '/pessoas', { nome: 'Ana', email: 'ana@example.com' }, 201);
  const second = await call('POST', '/pessoas', { nome: 'Bruno', email: 'bruno@example.com' }, 201);
  assert.equal((await call('GET', '/pessoas', null, 200)).length, 2);
  await call('PUT', `/pessoas/${person.objectId}`, { nome: 'Sem email' }, 400);
  await call('PATCH', `/pessoas/${person.objectId}`, { nome: 'Ana Atualizada' }, 200);
  await call('GET', '/pessoas?limit=101', null, 400);
  await call('POST', '/projetos', { nome: 'Teste', descricao: 'Teste', pessoaId: 'missing' }, 404);
  await call('POST', '/formacoes', { instituicao: 'X', curso: 'X', inicio: '2026-02-30', pessoaId: person.objectId }, 400);
  const records = {
    formacoes: { instituicao: 'UNICAP', curso: 'Computação', inicio: '2025-02-01' },
    experiencias: { empresa: 'Exemplo', cargo: 'Dev', inicio: '2025-03-01' },
    projetos: { nome: 'API', descricao: 'API REST', tecnologias: ['JS'] },
  };
  for (const [entity, body] of Object.entries(records)) {
    const row = await call('POST', `/${entity}`, { ...body, pessoaId: person.objectId }, 201);
    records[entity] = row;
    assert.equal((await call('GET', `/${entity}/${row.objectId}`, null, 200)).pessoaId, person.objectId);
    assert.equal((await call('GET', `/pessoas/${person.objectId}/${entity}`, null, 200)).length, 1);
    await call('PATCH', `/${entity}/${row.objectId}`, { descricao: 'Atualizado' }, 200);
    await call('PUT', `/${entity}/${row.objectId}`, { ...body, pessoaId: person.objectId }, 200);
  }
  const curriculum = await call('GET', `/pessoas/${person.objectId}/curriculo`, null, 200);
  assert.equal(curriculum.formacoes.length, 1);
  assert.equal(curriculum.experiencias.length, 1);
  assert.equal(curriculum.projetos.length, 1);
  await call('DELETE', `/pessoas/${person.objectId}`, null, 409);
  await call('PATCH', `/projetos/${records.projetos.objectId}`, { pessoaId: second.objectId }, 200);
  assert.equal((await call('GET', `/pessoas/${person.objectId}/projetos`, null, 200)).length, 0);
  assert.equal((await call('GET', `/projetos?pessoaId=${second.objectId}`, null, 200)).length, 1);
  for (const [entity, row] of Object.entries(records)) await call('DELETE', `/${entity}/${row.objectId}`, null, 204);
  await call('DELETE', `/pessoas/${person.objectId}`, null, 204);
  await call('GET', `/pessoas/${person.objectId}`, null, 404);
  await call('DELETE', `/pessoas/${second.objectId}`, null, 204);
  const invalid = await fetch(base + '/pessoas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
  assert.equal(invalid.status, 400);
});
