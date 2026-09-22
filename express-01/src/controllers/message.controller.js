import messageService from "../services/message.service.js";

const listMessages = async (req, res) => {
  const messages = await messageService.listMessages(req.context.models);
  return res.send(messages);
};

const getMessageById = async (req, res) => {
  const message = await messageService.getMessageById(
    req.context.models,
    req.params.messageId,
  );
  return res.send(message);
};

const createMessage = async (req, res) => {
  const message = await messageService.createMessage(
    req.context.models,
    req.body.text,
    req.context.me.id,
  );

  return res.send(message);
};

const deleteMessage = async (req, res) => {
  await messageService.deleteMessage(req.context.models, req.params.messageId);
  return res.send(true);
};

export default {
  listMessages,
  getMessageById,
  createMessage,
  deleteMessage,
};
