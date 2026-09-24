import "dotenv/config";
import cors from "cors";
import express from "express";

import models, { sequelize } from "./models/index.js";
import routes from "./routes/index.js";
import middlewares from "./middlewares/index.js";
import utils from "./utils/index.js";

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

const port = process.env.PORT || 3000;
const eraseDatabaseOnSync = process.env.ERASE_DATABASE_ON_SYNC === "true";

sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
  if (eraseDatabaseOnSync) {
    await utils.createUsersWithMessages();
  }

  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
});
