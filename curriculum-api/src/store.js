export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export class ParseStore {
  async request(method, path, body) {
    if (!process.env.BACK4APP_APP_ID || !process.env.BACK4APP_MASTER_KEY) {
      throw new HttpError(503, 'Configure as credenciais do Back4App no servidor.');
    }
    let response;
    try {
      response = await fetch(`${(process.env.BACK4APP_SERVER_URL || 'https://parseapi.back4app.com').replace(/\/$/, '')}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json', 'X-Parse-Application-Id': process.env.BACK4APP_APP_ID, 'X-Parse-Master-Key': process.env.BACK4APP_MASTER_KEY },
        ...(body ? { body: JSON.stringify(body) } : {}),
        signal: AbortSignal.timeout(15000),
      });
    } catch { throw new HttpError(502, 'Não foi possível acessar o Back4App.'); }
    const data = await response.json();
    if (!response.ok) {
      throw new HttpError(data.code === 101 ? 404 : data.code === 137 ? 409 : 502,
        data.code === 101 ? 'Registro não encontrado.' : 'O Back4App recusou a operação. Verifique a configuração do servidor.');
    }
    return data;
  }
  async list(entity, where = {}, { limit = 100, skip = 0 } = {}) {
    const query = new URLSearchParams({ where: JSON.stringify(where), limit: String(limit), skip: String(skip), order: 'createdAt,objectId' });
    try { return (await this.request('GET', `/classes/${entity}?${query}`)).results; }
    catch (error) { if (error.status === 404) return []; throw error; }
  }
  get(entity, id) { return this.request('GET', `/classes/${entity}/${encodeURIComponent(id)}`); }
  async create(entity, data) {
    const result = await this.request('POST', `/classes/${entity}`, { ...data, ACL: {} });
    return { ...data, ...result };
  }
  async update(entity, id, data) {
    const result = await this.request('PUT', `/classes/${entity}/${encodeURIComponent(id)}`, data);
    return { ...await this.get(entity, id), ...result };
  }
  delete(entity, id) { return this.request('DELETE', `/classes/${entity}/${encodeURIComponent(id)}`); }
}

export const pointer = id => ({ __type: 'Pointer', className: 'Person', objectId: id });
