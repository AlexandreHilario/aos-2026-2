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

const deleteMessage = async (models, messageId) => {
  return models.Message.destroy({
    where: { id: messageId },
  });
};

export default {
  listMessages,
  getMessageById,
  createMessage,
  deleteMessage,
};
