import { Router } from "express";

import controllers from "../controllers/index.js";

const messageController = controllers.message;

const router = Router();

router.get("/", messageController.listMessages);
router.get("/:messageId", messageController.getMessageById);
router.post("/", messageController.createMessage);
router.delete("/:messageId", messageController.deleteMessage);

export default router;
