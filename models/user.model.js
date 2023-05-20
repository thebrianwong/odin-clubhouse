const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  roles: [String],
  posts: { type: [Schema.Types.ObjectId], ref: "Posts" },
});

userSchema.virtual("isMember").get(function () {
  return this.roles.includes("Member");
});

userSchema.virtual("isAdmin").get(function () {
  return this.roles.includes("Admin");
});

const User = mongoose.model("User", userSchema);

module.exports = User;
