import 'dotenv/config';
import models, { sequelize } from './models/index.js';
import { createApp } from './createApp.js';
import utils from './utils/index.js';

const port = process.env.PORT || 3000;
const eraseDatabaseOnSync = process.env.ERASE_DATABASE_ON_SYNC === 'true';
async function start() {
  await sequelize.sync({ force: eraseDatabaseOnSync });
  if (eraseDatabaseOnSync) await utils.createUsersWithMessages();
  createApp(models).listen(port, () => console.log(`API: http://localhost:${port}`));
}
start().catch(() => {
  console.error('Nao foi possivel iniciar o servidor. Confira DATABASE_URL e o acesso ao PostgreSQL.');
  process.exitCode = 1;
});
