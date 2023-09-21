const jwt = require("jsonwebtoken");

const JWT_SECRET = require("../util/credentials").JWT_SECRET;

const errorHandler = require("../util/errorHandler");
module.exports = (req, res, next) => {
  let authHeader = req.get("Authorization");
  if (!authHeader) {
    // No authorization header
    return errorHandler(401, "Invalid Header!", next);
  }
  let token = authHeader.split(" ")[1];
  let decodedToken = jwt.verify(token, JWT_SECRET);

  if (!decodedToken) {
    // Invalid token
    return errorHandler(401, "Invalid Token!", next);
  }
  req.userId = decodedToken.userId;
  next();
};
