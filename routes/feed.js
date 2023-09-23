const express = require("express");
const { body } = require("express-validator");

const router = express.Router();
const isAuth = require("../middleware/is-auth");

const feedController = require("../controllers/feed");

//GET /feed/posts
router.get("/posts", isAuth, feedController.getPosts);

//POST /feed/post
router.post(
  "/post",
  isAuth,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedController.createPost
);

router.get("/post/:postId", isAuth, feedController.getPost);

router.put(
  "/post/:postId",
  isAuth,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedController.updatePost
);

router.delete("/post/:postId", isAuth, feedController.deletePost);

router.get("/status", isAuth, feedController.getStatus);
router.patch(
  "/status",
  isAuth,
  [body("status").trim().not().isEmpty()],
  feedController.updateStatus
);

module.exports = router;
