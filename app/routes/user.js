const express = require("express");
const {
  signUp,
  signIn,
  isSignedIn,
  searchUser,
} = require("../controllers/user");
const { authorization } = require("../middlewares/authorization");

const router = express.Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.get("/isSignedIn", isSignedIn);
router.post("/search", authorization, searchUser);
module.exports = router;
