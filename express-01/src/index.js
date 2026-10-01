import "dotenv/config";
import cors from "cors";
import express from "express";

import models, { sequelize } from "./models/index.js";
import routes from "./routes/index.js";
import middlewares from "./middlewares/index.js";
import utils from "./utils/index.js";
import AppError from "./utils/appError.js";
import Sequelize from "sequelize";

const app = express();

app.set("trust proxy", true);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  req.context = { models };
  next();
});
app.use(middlewares.logger);
app.use(middlewares.auth);

app.get("/", (req, res) => {
  return res.send("Servidor express exectuando...");
});

app.use("/session", routes.session);
app.use("/users", routes.user);
app.use("/messages", routes.message);

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

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
    message = "Este registro já existe.";
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

const port = process.env.PORT || 3000;
const eraseDatabaseOnSync = process.env.ERASE_DATABASE_ON_SYNC === "true";

sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
  if (eraseDatabaseOnSync) {
    await utils.createUsersWithMessages();
  }

  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
});
