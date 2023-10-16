const express = require("express");

const { authorization } = require("../middlewares/authorization");
const { createChat, addMessage } = require("../controllers/chat");

const router = express.Router();

router.post("/create", authorization, createChat);
router.post("/message", authorization, addMessage);
module.exports = router;
