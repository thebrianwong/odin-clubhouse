const mongoose = require("mongoose");

const { Schema } = mongoose;

const postSchema = new Schema({
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  date: { type: Date, required: true },
  message: { type: String, required: true },
});

postSchema.virtual("formattedDate").get(function () {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const { date } = this;
  const year = date.getFullYear();
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  return `${month} ${day}, ${year}`;
});

postSchema.virtual("formattedTime").get(function () {
  let hours = this.date.getHours();
  let minutes = this.date.getMinutes();
  let isAM = true;
  if (hours > 12) {
    hours -= 12;
    isAM = false;
  }
  if (minutes < 10) {
    minutes = `0${minutes}`;
  }
  if (isAM) {
    return `${hours}:${minutes} a.m.`;
  }
  return `${hours}:${minutes} p.m.`;
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
