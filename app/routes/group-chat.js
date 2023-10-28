const express = require("express");

const { authorization } = require("../middlewares/authorization");
const { createGroup } = require("../controllers/group-chat");

const router = express.Router();

router.post("/create", authorization, createGroup);
// router.post('/message', authorization, addMessage);

module.exports = router;
