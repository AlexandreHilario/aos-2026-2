import userService from "../services/user.service.js";

const getSession = async (req, res) => {
  const user = await userService.getUserById(req.context.models, req.context.me.id);
  return res.send(user);
};

export default {
  getSession,
};
