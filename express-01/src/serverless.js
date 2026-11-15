import 'dotenv/config';
import models, { sequelize } from './models/index.js';
import { createApp } from './createApp.js';

let ready;
function initialize() {
  if (!ready) ready = sequelize.sync().catch(error => { ready = undefined; throw error; });
  return ready;
}
export default createApp(models, initialize);
