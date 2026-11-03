import { writeFileSync } from 'node:fs';
const items = [];
function request(name, method, path, status, body, variable, extra = []) {
  items.push({ name, request: { method, header: [{ key: 'Content-Type', value: 'application/json' }, { key: 'x-api-key', value: '{{apiKey}}' }], url: '{{baseUrl}}' + path, ...(body ? { body: { mode: 'raw', raw: JSON.stringify(body, null, 2), options: { raw: { language: 'json' } } } } : {}) }, event: [{ listen: 'test', script: { type: 'text/javascript', exec: [`pm.test('Status ${status}', () => pm.response.to.have.status(${status}));`, ...(variable ? [`if (pm.response.code === ${status}) pm.collectionVariables.set('${variable}', pm.response.json().objectId);`] : []), ...extra] } }] });
}
request('01 - Saúde', 'GET', '/health', 200);
request('02 - Consultar pessoas já cadastradas', 'GET', '/pessoas', 200);
request('03 - Criar pessoa de teste', 'POST', '/pessoas', 201, { nome: 'Pessoa Postman', email: 'postman@example.com', resumo: 'Registro temporário' }, 'pessoaId');
request('04 - Criar segunda pessoa de teste', 'POST', '/pessoas', 201, { nome: 'Segunda Pessoa Postman', email: 'postman2@example.com' }, 'outraPessoaId');
request('05 - Consultar pessoa', 'GET', '/pessoas/{{pessoaId}}', 200);
request('06 - Alterar pessoa', 'PATCH', '/pessoas/{{pessoaId}}', 200, { resumo: 'Resumo atualizado no Postman' });
const payloads = {
  formacoes: { instituicao: 'UNICAP', curso: 'Sistemas para Internet', inicio: '2026-02-01', pessoaId: '{{pessoaId}}' },
  experiencias: { empresa: 'Empresa de teste', cargo: 'Estagiário', inicio: '2026-03-01', pessoaId: '{{pessoaId}}' },
  projetos: { nome: 'API de currículos', descricao: 'Projeto da disciplina AOS', tecnologias: ['Express', 'Back4App'], pessoaId: '{{pessoaId}}' },
};
for (const [entity, body] of Object.entries(payloads)) {
  const variable = `${entity}Id`;
  request(`Criar ${entity}`, 'POST', `/${entity}`, 201, body, variable);
  request(`Listar ${entity}`, 'GET', `/${entity}?limit=10&skip=0`, 200);
  request(`Consultar ${entity}`, 'GET', `/${entity}/{{${variable}}}`, 200);
  request(`Atualizar ${entity}`, 'PATCH', `/${entity}/{{${variable}}}`, 200, { descricao: 'Descrição atualizada' });
  request(`Substituir campos obrigatórios de ${entity}`, 'PUT', `/${entity}/{{${variable}}}`, 200, body);
  request(`Consultar vínculo de ${entity}`, 'GET', `/pessoas/{{pessoaId}}/${entity}`, 200, null, null, ["pm.test('Vínculo pertence à pessoa', () => pm.response.json().forEach(item => pm.expect(item.pessoaId).to.eql(pm.collectionVariables.get('pessoaId'))));"]);
}
request('Currículo completo', 'GET', '/pessoas/{{pessoaId}}/curriculo', 200);
request('Bloquear exclusão com vínculos', 'DELETE', '/pessoas/{{pessoaId}}', 409);
request('Transferir projeto para outra pessoa', 'PATCH', '/projetos/{{projetosId}}', 200, { pessoaId: '{{outraPessoaId}}' });
request('Confirmar novo vínculo', 'GET', '/pessoas/{{outraPessoaId}}/projetos', 200, null, null, ["pm.test('Projeto transferido', () => pm.expect(pm.response.json().map(item => item.objectId)).to.include(pm.collectionVariables.get('projetosId')));"]);
request('Rejeitar pessoa inexistente', 'POST', '/projetos', 404, { nome: 'Inválido', descricao: 'Vínculo inválido', pessoaId: 'inexistente' });
request('Rejeitar campos inválidos', 'POST', '/pessoas', 400, { nome: 'Sem email' });
for (const entity of Object.keys(payloads)) request(`Excluir ${entity} de teste`, 'DELETE', `/${entity}/{{${entity}Id}}`, 204);
request('Excluir primeira pessoa de teste', 'DELETE', '/pessoas/{{pessoaId}}', 204);
request('Excluir segunda pessoa de teste', 'DELETE', '/pessoas/{{outraPessoaId}}', 204);
request('Confirmar exclusão', 'GET', '/pessoas/{{pessoaId}}', 404);
const collection = { info: { name: 'Currículos - Express + Back4App', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json', description: 'Execute em ordem. Configure baseUrl com a URL real do Vercel e apiKey com API_WRITE_KEY. Cria e exclui apenas registros de teste.' }, variable: [{ key: 'baseUrl', value: 'http://localhost:3000' }, { key: 'apiKey', value: '' }, ...['pessoaId', 'outraPessoaId', 'formacoesId', 'experienciasId', 'projetosId'].map(key => ({ key, value: '' }))], item: items };
writeFileSync(new URL('../postman/curriculos.postman_collection.json', import.meta.url), JSON.stringify(collection, null, 2) + '\n');
