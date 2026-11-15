import * as service from '../services/tarefaService.js';
import { criarSchema, atualizarSchema, idSchema } from '../validators/tarefa.js';

export async function criarTarefa(req, res) {
  const tarefa = await service.criarTarefa(req.context.models, criarSchema.parse(req.body));
  return res.location(`/tarefas/${tarefa.objectId}`).status(201).json(tarefa);
}
export async function listarTarefas(req, res) {
  return res.json(await service.listarTarefas(req.context.models));
}
export async function buscarTarefa(req, res) {
  return res.json(await service.buscarTarefa(req.context.models, idSchema.parse(req.params.objectId)));
}
export async function atualizarTarefa(req, res) {
  return res.json(await service.atualizarTarefa(req.context.models, idSchema.parse(req.params.objectId), atualizarSchema.parse(req.body)));
}
export async function removerTarefa(req, res) {
  await service.removerTarefa(req.context.models, idSchema.parse(req.params.objectId));
  return res.status(204).end();
}
