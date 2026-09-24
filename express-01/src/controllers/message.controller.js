import services from "../services/index.js";

const messageService = services.message;

const ensureAuthenticated = (req, res) => {
  if (!req.context?.me) {
    res.status(401).send({ error: "Authentication required" });
    return false;
  }

  return true;
};

const listMessages = async (req, res) => {
  if (!ensureAuthenticated(req, res)) return;

  const messages = await messageService.listMessages(req.context.models);
  return res.status(200).send(messages);
};

const getMessageById = async (req, res) => {
  if (!ensureAuthenticated(req, res)) return;

  const message = await messageService.getMessageById(
    req.context.models,
    req.params.messageId,
  );

  if (!message) {
    return res.status(404).send({ error: "Message not found" });
  }

  return res.status(200).send(message);
};

const createMessage = async (req, res) => {
  if (!ensureAuthenticated(req, res)) return;

  const message = await messageService.createMessage(
    req.context.models,
    req.body.text,
    req.context.me.id,
  );

  return res.status(201).send(message);
};

const deleteMessage = async (req, res) => {
  if (!ensureAuthenticated(req, res)) return;

  await messageService.deleteMessage(req.context.models, req.params.messageId);
  return res.status(204).send();
};

export default {
  listMessages,
  getMessageById,
  createMessage,
  deleteMessage,
};
