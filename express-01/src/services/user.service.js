const listUsers = async (models) => {
  return models.User.findAll();
};

const getUserById = async (models, userId) => {
  return models.User.findByPk(userId);
};

export default {
  listUsers,
  getUserById,
};
