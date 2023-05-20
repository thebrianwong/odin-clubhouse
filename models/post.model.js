const mongoose = require("mongoose");

const { Schema } = mongoose;

const postSchema = new Schema({
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  date: { type: Date, required: true },
  message: { type: String, required: true },
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;