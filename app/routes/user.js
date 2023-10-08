const express = require("express");
const { signUp, signIn, isSignedIn } = require("../controllers/user");
const { authorization } = require("../middlewares/authorization");

const router = express.Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.get("/isSignedIn", authorization, isSignedIn);
module.exports = router;
