const listMessages = async (models) => {
  return models.Message.findAll();
};

const getMessageById = async (models, messageId) => {
  return models.Message.findByPk(messageId);
};

const createMessage = async (models, text, userId) => {
  return models.Message.create({
    text,
    userId,
  });
};

const updateMessage = async (models, messageId, text) => {
  const message = await models.Message.findByPk(messageId);

  if (!message) {
    return null;
  }

  await message.update({ text });
  return message;
};

const deleteMessage = async (models, messageId) => {
  return models.Message.destroy({
    where: { id: messageId },
  });
};

export default {
  listMessages,
  getMessageById,
  createMessage,
  updateMessage,
  deleteMessage,
};
