import { Router } from "express";

import controllers from "../controllers/index.js";

const userController = controllers.user;

const router = Router();

router.get("/", userController.listUsers);
router.get("/:userId", userController.getUserById);
router.post("/", userController.createUser);
router.put("/:userId", userController.updateUser);
router.delete("/:userId", userController.deleteUser);

export default router;
