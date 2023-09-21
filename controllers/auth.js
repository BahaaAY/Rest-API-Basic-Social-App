const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

const errorHandler = require("../util/errorHandler");

const JWT_SECRET = require("../util/credentials").JWT_SECRET;

exports.signup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.data = errors.array();
    return errorHandler(422, error, next);
  }

  // Hash password
  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      // Create user in db
      const user = new User({
        email: email,
        password: hashedPassword,
        name: name,
      });
      return user.save();
    })
    .then((result) => {
      // Status code 201 means something was created
      return res
        .status(201)
        .json({ message: "User created!", userId: result._id });
    })
    .catch((err) => {
      errorHandler(500, "Creating user failed.", next);
    });
};
exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return errorHandler(401, "User not found.", next);
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        return errorHandler(401, "User not found.", next);
      }
      // Generate token
      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString(),
        },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
      return res
        .status(200)
        .json({ token: token, userId: loadedUser._id.toString() });
    })
    .catch((err) => {
      errorHandler(500, err, next);
    });
};
