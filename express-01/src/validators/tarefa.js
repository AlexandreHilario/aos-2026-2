import { z } from 'zod';

const descricao = z.string().trim().min(1, 'A descricao e obrigatoria.').max(2000);
export const criarSchema = z.strictObject({ descricao, concluida: z.boolean().default(false) });
export const atualizarSchema = z.strictObject({ descricao: descricao.optional(), concluida: z.boolean().optional() })
  .refine(data => Object.keys(data).length > 0, 'Informe descricao ou concluida.');
export const idSchema = z.uuid();
