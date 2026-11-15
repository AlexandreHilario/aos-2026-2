import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { randomUUID } from 'node:crypto';

test('CRUD HTTP, UUID, valores padrao, validacao e registros inexistentes', async t => {
  const rows = new Map();
  const models = { Tarefa: {
    async create(data) {
      const row = { ...data, objectId: randomUUID(), createdAt: new Date().toISOString(),
        async update(changes) { Object.assign(this, changes); return this; },
        async destroy() { rows.delete(this.objectId); }
      };
      rows.set(row.objectId, row); return row;
    },
    async findAll() { return [...rows.values()]; },
    async findByPk(id) { return rows.get(id) || null; },
  } };
  const server = createApp(models).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}/tarefas`;
  const request = (path = '', method = 'GET', body) => fetch(base + path, { method, headers: { 'Content-Type': 'application/json' }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
  for (const body of [{}, { descricao: ' ' }, { descricao: 1 }, { descricao: 'x', concluida: 'false' }, { descricao: 'x', objectId: 'injetado' }]) {
    assert.equal((await request('', 'POST', body)).status, 400);
  }
  const response = await request('', 'POST', { descricao: ' Estudar Zod ' });
  assert.equal(response.status, 201);
  const created = await response.json();
  assert.match(created.objectId, /^[0-9a-f-]{36}$/);
  assert.equal(created.concluida, false);
  assert.equal(created.descricao, 'Estudar Zod');
  const path = `/${created.objectId}`;
  assert.deepEqual(await (await request(path)).json(), created);
  assert.equal((await (await request()).json()).length, 1);
  assert.equal((await request(path, 'PUT', {})).status, 400);
  let updated = await (await request(path, 'PUT', { concluida: true })).json();
  assert.equal(updated.concluida, true);
  assert.equal(updated.descricao, created.descricao);
  updated = await (await request(path, 'PUT', { descricao: 'Entregar atividade' })).json();
  assert.equal(updated.concluida, true);
  assert.equal(updated.descricao, 'Entregar atividade');
  assert.equal((await request(path, 'DELETE')).status, 204);
  for (const method of ['GET', 'PUT', 'DELETE']) assert.equal((await request(path, method, method === 'PUT' ? { concluida: false } : undefined)).status, 404);
  assert.deepEqual(await (await request()).json(), []);
  assert.equal((await request('/id-invalido')).status, 400);
  assert.equal((await fetch(base, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' })).status, 400);
});
