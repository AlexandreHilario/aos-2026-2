import userService from "../services/user.service.js";

const listUsers = async (req, res) => {
  const users = await userService.listUsers(req.context.models);
  return res.send(users);
};

const getUserById = async (req, res) => {
  const user = await userService.getUserById(req.context.models, req.params.userId);
  return res.send(user);
};

const createUser = (req, res) => {
  return res.send("POST HTTP method on user resource");
};

const updateUser = (req, res) => {
  return res.send(`PUT HTTP method on user/${req.params.userId} resource`);
};

const deleteUser = (req, res) => {
  return res.send(`DELETE HTTP method on user/${req.params.userId} resource`);
};

export default {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
