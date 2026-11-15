import "dotenv/config";
import cors from "cors";
import express from "express";

import { ZodError } from "zod";
import routes from "./routes/index.js";
import middlewares from "./middlewares/index.js";

import AppError from "./utils/appError.js";
import Sequelize from "sequelize";

export function createApp(models, initialize = async () => {}, app = express()) {
  
  app.set("trust proxy", true);
  
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use((req, res, next) => {
    req.context = { models };
    next();
  });
  app.use(middlewares.logger);
  
  
  app.get("/", (req, res) => {
    return res.send("Servidor Express executando...");
  });
  
  app.use(async (req, res, next) => { await initialize(); next(); });
  app.use("/tarefas", routes.tarefa);
  app.use(middlewares.auth);
  app.use("/session", routes.session);
  app.use("/users", routes.user);
  app.use("/messages", routes.message);
  app.use((req, res) => res.status(404).json({ message: "Rota nao encontrada." }));
  
  app.use((err, req, res, next) => {
    if (res.headersSent) {
      return next(err);
    }
  
    if (err instanceof ZodError) return res.status(400).json({ message: 'Dados invalidos.', errors: err.issues.map(({ path, message }) => ({ campo: path.join('.'), message })) });
    if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'JSON invalido.' });
    if (err.type === 'entity.too.large') return res.status(413).json({ message: 'Corpo muito grande.' });
    let statusCode = 500;
    let status = "error";
    let message = "Algo deu errado no servidor";
  
    if (err instanceof AppError) {
      statusCode = err.statusCode;
      status = err.status;
      message = err.message;
    } else if (err instanceof Sequelize.UniqueConstraintError) {
      statusCode = 409;
      status = "fail";
      message = "Este registro jÃ¡ existe.";
    } else if (err instanceof Sequelize.ValidationError) {
      statusCode = 400;
      status = "fail";
      message = err.errors.map((error) => error.message).join("; ");
    }
  
    const response = { status, message };
  
    if (process.env.NODE_ENV === "development") {
      response.stack = err.stack;
    }
  
    return res.status(statusCode).json(response);
  });
  
  return app;
}

