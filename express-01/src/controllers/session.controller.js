import services from "../services/index.js";

const userService = services.user;

const getSession = async (req, res) => {
  if (!req.context?.me) {
    return res.status(401).send({ error: "Authentication required" });
  }

  const user = await userService.getUserById(req.context.models, req.context.me.id);
  return res.status(200).send(user);
};

export default {
  getSession,
};
