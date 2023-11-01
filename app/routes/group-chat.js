const express = require("express");

const { authorization } = require("../middlewares/authorization");
const {
  createGroup,
  addMessage,
  addMember,
} = require("../controllers/group-chat");

const router = express.Router();

router.post("/create", authorization, createGroup);
router.post("/message", authorization, addMessage);
router.post("/member", authorization, addMember);

module.exports = router;
