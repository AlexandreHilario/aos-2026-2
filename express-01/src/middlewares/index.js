import loggerMiddleware from "./logger.middleware.js";
import authMiddleware from "./auth.middleware.js";

export default {
  logger: loggerMiddleware,
  auth: authMiddleware,
};
