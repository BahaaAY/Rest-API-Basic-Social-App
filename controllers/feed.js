const { validationResult } = require("express-validator");

const Post = require("../models/post");
const errorHandler = require("../util/errorHandler");

const clearImage = require("../util/clearImage");

exports.getPosts = (req, res, next) => {
  let totalItems;
  const currentPage = req.query.page || 1;
  const perPage = 2;
  Post.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Post.find()
        .limit(perPage)
        .skip((currentPage - 1) * perPage);
    })
    .then((posts) => {
      // Status code 200 means everything is ok
      return res.status(200).json({
        message: "Fetched posts successfully.",
        posts: posts,
        totalItems: totalItems,
      });
    })
    .catch((err) => {
      errorHandler(500, "Fetching posts failed.", next);
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
  if (!req.file) {
    // Status code 422 means something went wrong with the validation
    return errorHandler(422, "No image provided.", next);
  }

  const post = new Post({
    title: title,
    content: content,
    imageUrl: req.file.path,
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

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        // Status code 404 : Post not found!
        return errorHandler(404, "Post not found!", next);
      }
      // Status code 200 means everything is ok
      return res.status(200).json({
        message: "Post fetched.",
        post: post,
      });
    })
    .catch((err) => {
      errorHandler(500, "Fetching post failed.", next);
    });
};

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Status code 422 means something went wrong with the validation
    return errorHandler(
      422,
      "Validation failed, entered data is incorrect.",
      next
    );
  }
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path;
  }
  if (!imageUrl || imageUrl === "undefined") {
    // Status code 422 means something went wrong with the validation
    return errorHandler(422, "No Image provided!", next);
  }

  console.log("Updating Post!: ", postId, title, content, imageUrl);
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        // Status code 404 : Post not found!
        return errorHandler(404, "Post not found!", next);
      }

      post.title = title;
      post.content = content;
      if (imageUrl != post.imageUrl) {
        // Delete old image
        console.log("Deleting old image!");
        clearImage(post.imageUrl, next);
      }
      post.imageUrl = imageUrl;
      return post.save();
    })
    .then((result) => {
      // Status code 200 means everything is ok
      return res.status(200).json({
        message: "Post updated!",
        post: result,
      });
    })
    .catch((err) => {
      errorHandler(500, "Updating post failed.", next);
    });
};
exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  console.log("Deleting Post!: ", postId);
  if (!postId) {
    return errorHandler(404, "Post not found!", next);
  }
  Post.findByIdAndDelete(postId)
    .then((post) => {
      if (!post) {
        // Status code 404 : Post not found!
        return errorHandler(404, "Post not found!", next);
      }
      // Delete post image
      console.log("Deleting post image!");
      clearImage(post.imageUrl, next);
      // Status code 200 means everything is ok
      return res.status(200).json({
        message: "Post deleted!",
      });
    })
    .catch((err) => {});
};
