import { Router } from "express";

import messageController from "../controllers/message.controller.js";

const router = Router();

router.get("/", messageController.listMessages);
router.get("/:messageId", messageController.getMessageById);
router.post("/", messageController.createMessage);
router.delete("/:messageId", messageController.deleteMessage);

export default router;
