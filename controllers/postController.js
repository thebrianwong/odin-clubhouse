const Post = require("../models/post.model");
const User = require("../models/user.model");

const getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().populate("createdBy").exec();
    console.log(posts);
    res.render("posts", { posts });
  } catch (err) {
    throw new Error("There was an error loading posts from the database.");
  }
};

module.exports = {
  getAllPosts,
};
