const listUsers = async (models) => {
  return models.User.findAll();
};

const getUserById = async (models, userId) => {
  return models.User.findByPk(userId);
};

const createUser = async (models, username, email) => {
  return models.User.create({ username, email });
};

const updateUser = async (models, userId, username, email) => {
  const user = await models.User.findByPk(userId);

  if (!user) {
    return null;
  }

  await user.update({ username, email });
  return user;
};

const deleteUser = async (models, userId) => {
  return models.User.destroy({ where: { id: userId } });
};

export default {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
