const authMiddleware = async (req, res, next) => {
  req.context = {
    models: req.context?.models,
    me: req.context?.me,
  };

  if (!req.context.models) {
    return res.status(500).send({ error: "Model context not initialized" });
  }

  if (!req.context.me) {
    req.context.me = await req.context.models.User.findByLogin("rwieruch");
  }

  next();
};

export default authMiddleware;
