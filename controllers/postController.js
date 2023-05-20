const { body, validationResult } = require("express-validator");
const Post = require("../models/post.model");
const User = require("../models/user.model");

const getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate("createdBy")
      .sort({ date: "descending" })
      .exec();
    console.log(posts);
    res.render("posts", { posts, user: req.user });
  } catch (err) {
    throw new Error("There was an error loading posts from the database.");
  }
};

const getNewPostPage = (req, res) => {
  if (!req.user) {
    res.status(403).send("Unauthorized");
  }
  res.render("new-post");
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
      // Redirect to sign up page with form filled with entered details
      res.status(401).send("errors");
    } else {
      next();
    }
  },
];

const createPost = async (req, res, next) => {
  if (!req.user) {
    res.status(403).send("Unauthorized");
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
  const user = await User.findById(userId).exec();
  user.posts.push(newPostDocument._id);
  await user.save();
  res.redirect("/post");
};

const postHandleNewPost = [validatePostDetails, createPost];

const deletePost = async (req, res) => {
  const deletionResult = await Post.deleteOne({ _id: req.params.id });
  if (deletionResult.deletedCount === 1) {
    res.redirect("/post");
    return;
  }
  res.status(404).send("That post does not exist.");
};

module.exports = {
  getAllPosts,
  getNewPostPage,
  postHandleNewPost,
  deletePost,
};
