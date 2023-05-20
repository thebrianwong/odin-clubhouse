const express = require("express");
const postController = require("../controllers/postController");

const router = express.Router();

router.get("/", postController.getAllPosts);

router.get("/new", postController.getNewPostPage);

router.post("/new", postController.postHandleNewPost);

router.delete("/:id/delete", postController.deletePost);

module.exports = router;
