const { body, validationResult } = require("express-validator");
const Post = require("../models/post.model");
const User = require("../models/user.model");

const getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate("createdBy")
      .sort({ date: "descending" })
      .exec();
    res.render("post/posts", { posts, user: req.user });
  } catch (err) {
    console.error(
      "There was an issue with database operations while querying all posts."
    );
    err.status = 500;
    next(err);
  }
};

const getNewPostPage = (req, res, next) => {
  if (!req.user) {
    next();
  }
  res.render("post/new-post");
};

const validatePostDetails = [
  body("title")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Title must not be empty.")
    .isString(),
  body("message")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Message must not be empty.")
    .isString(),
  (req, res, next) => {
    const result = validationResult(req);
    if (result.errors.length) {
      const { title, message } = req.body;
      const errors = result.errors.reduce(
        (totalErr, currentErr) => ({
          ...totalErr,
          [currentErr.path]: currentErr.msg,
        }),
        {}
      );
      res.render("post/new-post", { title, message, errors });
    } else {
      next();
    }
  },
];

const createPost = async (req, res, next) => {
  try {
    if (!req.user) {
      next();
    }
    const { title, message } = req.body;
    const userId = req.user.id;
    const newPost = new Post({
      createdBy: userId,
      title,
      date: new Date(),
      message,
    });
    const newPostDocument = await newPost.save();
    console.log(
      `A new post ID ${newPostDocument._id} was successfully created.`
    );
    res.redirect("/post");
  } catch (err) {
    console.error(
      "There was an issue with database operations while creating a post."
    );
    err.status = 500;
    next(err);
  }
};

const postHandleNewPost = [validatePostDetails, createPost];

const deletePost = async (req, res, next) => {
  try {
    const deletionResult = await Post.deleteOne({ _id: req.params.id }).exec();
    if (deletionResult.deletedCount === 1) {
      console.log(`Post ${req.params.id} was successfully deleted.`);
      res.redirect("/post");
      return;
    }
    console.error(`A post with ID ${req.params.id} does not exist.`);
    next();
  } catch (err) {
    console.error(
      "There was an issue with database operations while delete a post."
    );
    err.status = 500;
    next(err);
  }
};

module.exports = {
  getAllPosts,
  getNewPostPage,
  postHandleNewPost,
  deletePost,
};
