const { validationResult } = require("express-validator");

const Post = require("../models/post");
const User = require("../models/user");

const errorHandler = require("../util/errorHandler").errorHandler;
const postAuth = require("../util/auth").postAuth;
const clearImage = require("../util/clearImage");
const { catchErr } = require("../util/errorHandler");

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
      catchErr(err, next);
    });
};

exports.createPost = (req, res, next) => {
  console.log("Creating Post!");
  // Create post in db
  const title = req.body.title;
  const content = req.body.content;
  const userId = req.userId;
  let postCreator;

  const errors = validationResult(req);
  try {
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
      creator: userId,
    });
    post
      .save()
      .then((result) => {
        // Status code 201 means something was created
        return User.findById(userId);
      })
      .then((user) => {
        postCreator = user;
        user.posts.push(post);
        return user.save();
      })
      .then((result) => {
        return res.status(201).json({
          message: "Post created successfully!",
          post: post,
          creator: postCreator,
        });
      })
      .catch((err) => {
        errorHandler(500, "Creating post failed.", next);
      });
  } catch (err) {
    catchErr(err, next);
  }
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
      catchErr(err, next);
    });
};

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId;
  const userId = req.userId;
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      // Status code 422 means something went wrong with the validation
      return errorHandler(422, "Validation failed, entered data is incorrect.");
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
        postAuth(post, userId);
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
        catchErr(err, next);
      });
  } catch (err) {
    catchErr(err, next);
  }
};
exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  const userId = req.userId;
  let postToDelete;
  try {
    console.log("Deleting Post!: ", postId);
    if (!postId) {
      return errorHandler(404, "Post not found!", next);
    }
    Post.findById(postId)
      .then((post) => {
        if (!post) {
          // Status code 404 : Post not found!
          return errorHandler(404, "Post not found!", next);
        }
        postToDelete = post;

        //check if user is post owner
        postAuth(post, userId);

        postToDelete = post;
        return Post.deleteOne({ _id: postId });
      })
      .then((result) => {
        // Delete post image
        console.log("Deleting post image!");
        clearImage(postToDelete.imageUrl, next);
        // Status code 200 means everything is ok
        return res.status(200).json({
          message: "Post deleted!",
        });
      })
      .catch((err) => {
        catchErr(err, next);
      });
  } catch (err) {
    catchErr(err, next);
  }
};
