import { randomUUID } from 'node:crypto';

export default (sequelize, { DataTypes }) => sequelize.define('tarefa', {
  objectId: { type: DataTypes.UUID, defaultValue: () => randomUUID(), primaryKey: true, allowNull: false },
  descricao: {
    type: DataTypes.TEXT, allowNull: false,
    validate: { notEmpty: true, len: [1, 2000] },
  },
  concluida: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, { tableName: 'tarefas' });
