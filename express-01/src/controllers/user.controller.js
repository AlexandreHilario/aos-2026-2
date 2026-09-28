import services from "../services/index.js";

const userService = services.user;

const listUsers = async (req, res) => {
  const users = await userService.listUsers(req.context.models);
  return res.status(200).send(users);
};

const getUserById = async (req, res) => {
  const user = await userService.getUserById(req.context.models, req.params.userId);

  if (!user) {
    return res.status(404).send({ error: "User not found" });
  }

  return res.status(200).send(user);
};

const createUser = async (req, res) => {
  const user = await userService.createUser(
    req.context.models,
    req.body.username,
    req.body.email,
  );

  return res.status(201).send(user);
};

const updateUser = async (req, res) => {
  const user = await userService.updateUser(
    req.context.models,
    req.params.userId,
    req.body.username,
    req.body.email,
  );

  if (!user) {
    return res.status(404).send({ error: "User not found" });
  }

  return res.status(200).send(user);
};

const deleteUser = async (req, res) => {
  const deletedCount = await userService.deleteUser(
    req.context.models,
    req.params.userId,
  );

  if (!deletedCount) {
    return res.status(404).send({ error: "User not found" });
  }

  return res.status(204).send();
};

export default {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
