import { Router } from "express";

import controllers from "../controllers/index.js";

const sessionController = controllers.session;

const router = Router();

router.get("/", sessionController.getSession);

export default router;
