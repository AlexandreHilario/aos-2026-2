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

const createUser = (req, res) => {
  return res.status(201).send("POST HTTP method on user resource");
};

const updateUser = (req, res) => {
  return res.status(200).send(`PUT HTTP method on user/${req.params.userId} resource`);
};

const deleteUser = (req, res) => {
  return res.status(204).send();
};

export default {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
