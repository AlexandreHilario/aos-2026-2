import 'dotenv/config';
import assert from 'node:assert/strict';
import models, { sequelize } from '../src/models/index.js';
import { createApp } from '../src/createApp.js';

let server;
let objectId;
try {
  await sequelize.authenticate();
  await sequelize.sync();
  console.log('Neon: conexao e tabelas OK.');
  server = createApp(models).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/tarefas`;
  const request = (path = '', method = 'GET', data) => fetch(base + path, {
    method, headers: { 'Content-Type': 'application/json' },
    ...(data === undefined ? {} : { body: JSON.stringify(data) }),
  });
  let response = await request('', 'POST', { descricao: 'Teste temporario de integracao Neon' });
  assert.equal(response.status, 201);
  const created = await response.json();
  objectId = created.objectId;
  assert.match(objectId, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  assert.equal(created.concluida, false);
  response = await request(`/${objectId}`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), created);
  response = await request();
  assert.equal(response.status, 200);
  assert.ok((await response.json()).some(row => row.objectId === objectId));
  response = await request(`/${objectId}`, 'PUT', { concluida: true });
  assert.equal(response.status, 200);
  const updated = await response.json();
  assert.equal(updated.concluida, true);
  assert.equal(updated.descricao, created.descricao);
  assert.equal((await request('', 'POST', {})).status, 400);
  assert.equal((await request(`/${objectId}`, 'DELETE')).status, 204);
  assert.equal((await request(`/${objectId}`)).status, 404);
  console.log('Neon: CRUD HTTP, UUID, padrao false, atualizacao parcial, 400 e 404 OK.');
} catch (error) {
  // Nao imprimir a connection string nem detalhes que possam conter credenciais.
  console.error('Falha no teste Neon:', error.name, error instanceof assert.AssertionError ? error.message : 'Verifique a conexao e a configuracao do banco.');
  process.exitCode = 1;
} finally {
  try {
    if (objectId) await models.Tarefa.destroy({ where: { objectId } });
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    await sequelize.close();
  }
}
