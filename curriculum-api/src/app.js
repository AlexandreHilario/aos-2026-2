import express from 'express';
import { timingSafeEqual } from 'node:crypto';
import { ParseStore, HttpError, pointer } from './store.js';

export const entities = {
  pessoas: { className: 'Person', required: ['nome', 'email'], fields: ['nome', 'email', 'telefone', 'cidade', 'resumo', 'linkedin', 'github'] },
  formacoes: { className: 'Education', required: ['instituicao', 'curso', 'inicio', 'pessoaId'], fields: ['instituicao', 'curso', 'nivel', 'inicio', 'fim', 'descricao', 'pessoaId'] },
  experiencias: { className: 'Experience', required: ['empresa', 'cargo', 'inicio', 'pessoaId'], fields: ['empresa', 'cargo', 'inicio', 'fim', 'descricao', 'pessoaId'] },
  projetos: { className: 'Project', required: ['nome', 'descricao', 'pessoaId'], fields: ['nome', 'descricao', 'url', 'tecnologias', 'pessoaId'] },
};
const children = ['formacoes', 'experiencias', 'projetos'];
const serialize = ({ ACL, pessoa, ...data }) => ({ ...data, ...(pessoa ? { pessoaId: pessoa.objectId } : {}) });
function validate(body, schema, partial) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new HttpError(400, 'Envie um objeto JSON.');
  if (!Object.keys(body).length) throw new HttpError(400, 'Informe os campos da operação.');
  for (const key of Object.keys(body)) {
    if (!schema.fields.includes(key)) throw new HttpError(400, `Campo desconhecido: ${key}`);
    if (key === 'tecnologias') {
      if (!Array.isArray(body[key]) || body[key].some(value => typeof value !== 'string' || !value.trim())) throw new HttpError(400, 'tecnologias deve ser uma lista de textos.');
    } else if (typeof body[key] !== 'string' || !body[key].trim()) throw new HttpError(400, `${key} deve ser um texto não vazio.`);
  }
  for (const key of schema.required) if ((!partial || key in body) && !body[key]) throw new HttpError(400, `Campo obrigatório: ${key}`);
  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) throw new HttpError(400, 'Email inválido.');
  for (const key of ['inicio', 'fim']) {
    if (body[key] && (!/^\d{4}-\d{2}-\d{2}$/.test(body[key]) || Number.isNaN(Date.parse(body[key])) || new Date(body[key]).toISOString().slice(0, 10) !== body[key])) throw new HttpError(400, `${key} deve ser uma data válida no formato AAAA-MM-DD.`);
  }
  for (const key of ['url', 'linkedin', 'github']) if (body[key]) {
    let url; try { url = new URL(body[key]); } catch { throw new HttpError(400, `${key} deve ser uma URL válida.`); }
    if (!['https:', 'http:'].includes(url.protocol)) throw new HttpError(400, `${key} deve usar HTTP ou HTTPS.`);
  }
}
function pagination(query) {
  const limit = Number(query.limit ?? 100), skip = Number(query.skip ?? 0);
  if (!Number.isInteger(limit) || limit < 1 || limit > 100 || !Number.isInteger(skip) || skip < 0) throw new HttpError(400, 'Use limit entre 1 e 100 e skip maior ou igual a zero.');
  return { limit, skip };
}

export function createApp(store = new ParseStore()) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));
  app.get('/', (req, res) => res.json({ nome: 'API de currículos', entidades: Object.keys(entities), health: '/health' }));
  app.get('/health', (req, res) => res.json({ status: 'ok' }));
  app.use((req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    const expected = process.env.API_WRITE_KEY;
    if (!expected) return next(new HttpError(503, 'Configure API_WRITE_KEY no servidor para habilitar alterações.'));
    const supplied = Buffer.from(req.get('x-api-key') || '');
    const key = Buffer.from(expected);
    if (supplied.length !== key.length || !timingSafeEqual(supplied, key)) return next(new HttpError(401, 'Chave de escrita inválida.'));
    next();
  });
  for (const [route, schema] of Object.entries(entities)) {
    const entity = schema.className;
    app.get(`/${route}`, async (req, res) => {
      const where = {};
      if (route !== 'pessoas' && req.query.pessoaId) where.pessoa = pointer(req.query.pessoaId);
      res.json((await store.list(entity, where, pagination(req.query))).map(serialize));
    });
    app.get(`/${route}/:id`, async (req, res) => res.json(serialize(await store.get(entity, req.params.id))));
    const save = (partial, requireAll = false) => async (req, res) => {
      validate(req.body, schema, partial && !requireAll);
      const previous = partial ? await store.get(entity, req.params.id) : {};
      const combined = { ...previous, ...req.body };
      if (combined.inicio && combined.fim && combined.fim < combined.inicio) throw new HttpError(400, 'fim deve ser igual ou posterior a inicio.');
      const data = { ...req.body };
      if (data.pessoaId) {
        await store.get('Person', data.pessoaId);
        data.pessoa = pointer(data.pessoaId);
        delete data.pessoaId;
      }
      const saved = partial ? await store.update(entity, req.params.id, data) : await store.create(entity, data);
      res.status(partial ? 200 : 201).json(serialize(saved));
    };
    app.post(`/${route}`, save(false));
    app.patch(`/${route}/:id`, save(true));
    app.put(`/${route}/:id`, save(true, true));
    app.delete(`/${route}/:id`, async (req, res) => {
      await store.get(entity, req.params.id);
      if (route === 'pessoas') {
        for (const child of children) {
          if ((await store.list(entities[child].className, { pessoa: pointer(req.params.id) }, { limit: 1 })).length) throw new HttpError(409, 'Remova ou transfira os vínculos desta pessoa antes de excluí-la.');
        }
      }
      await store.delete(entity, req.params.id);
      res.status(204).end();
    });
  }
  for (const child of children) app.get(`/pessoas/:id/${child}`, async (req, res) => {
    await store.get('Person', req.params.id);
    res.json((await store.list(entities[child].className, { pessoa: pointer(req.params.id) }, pagination(req.query))).map(serialize));
  });
  app.get('/pessoas/:id/curriculo', async (req, res) => {
    const pessoa = serialize(await store.get('Person', req.params.id));
    for (const child of children) pessoa[child] = (await store.list(entities[child].className, { pessoa: pointer(req.params.id) }, pagination(req.query))).map(serialize);
    res.json(pessoa);
  });
  app.use((req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));
  app.use((error, req, res, next) => {
    const status = error.status || 500;
    res.status(status).json({ erro: error.type === 'entity.parse.failed' ? 'JSON inválido.' : status < 500 || error instanceof HttpError ? error.message : 'Erro interno do servidor.' });
  });
  return app;
}
export default createApp();
