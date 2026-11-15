import AppError from '../utils/appError.js';

export const criarTarefa = (models, data) => models.Tarefa.create(data);
export const listarTarefas = models => models.Tarefa.findAll({ order: [['createdAt', 'ASC'], ['objectId', 'ASC']] });
export async function buscarTarefa(models, objectId) {
  const tarefa = await models.Tarefa.findByPk(objectId);
  if (!tarefa) throw new AppError('Tarefa nao encontrada.', 404);
  return tarefa;
}
export async function atualizarTarefa(models, objectId, data) {
  const tarefa = await buscarTarefa(models, objectId);
  return tarefa.update(data);
}
export async function removerTarefa(models, objectId) {
  const tarefa = await buscarTarefa(models, objectId);
  await tarefa.destroy();
}
