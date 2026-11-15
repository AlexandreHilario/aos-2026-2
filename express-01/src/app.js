import 'dotenv/config';
import express from 'express';
import models, { sequelize } from './models/index.js';
import { createApp } from './createApp.js';

let ready;
function initialize() {
  if (!ready) ready = sequelize.sync().catch(error => { ready = undefined; throw error; });
  return ready;
}

const app = express();
createApp(models, initialize, app);

export default app;
