import { Router } from "express";

import userController from "../controllers/user.controller.js";

const router = Router();

router.get("/", userController.listUsers);
router.get("/:userId", userController.getUserById);
router.post("/", userController.createUser);
router.put("/:userId", userController.updateUser);
router.delete("/:userId", userController.deleteUser);

export default router;
