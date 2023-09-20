const { validationResult } = require("express-validator");

const Post = require("../models/post");
const errorHandler = require("../util/errorHandler");
exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        _id: "1",
        title: "First Post",
        content: "This is the first post!",
        creator: {
          name: "Bahaa",
        },
        createdAt: new Date(),
      },
    ],
  });
};

exports.createPost = (req, res, next) => {
  console.log("Creating Post!");
  // Create post in db
  const title = req.body.title;
  const content = req.body.content;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Status code 422 means something went wrong with the validation
    return errorHandler(
      422,
      "Validation failed, entered data is incorrect.",
      next
    );
  }
  const post = new Post({
    title: title,
    content: content,
    imageUrl: "images/flower.jpg",
    creator: { name: "Bahaa" },
  });
  post
    .save()
    .then((result) => {
      // Status code 201 means something was created
      return res.status(201).json({
        message: "Post created successfully!",
        post: result,
      });
    })
    .catch((err) => {
      errorHandler(500, "Creating post failed.", next);
    });
};
