import { Router } from 'express';
import * as controller from '../controllers/tarefaController.js';
const router = Router();
router.route('/').get(controller.listarTarefas).post(controller.criarTarefa);
router.route('/:objectId').get(controller.buscarTarefa).put(controller.atualizarTarefa).delete(controller.removerTarefa);
export default router;
