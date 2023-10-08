const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.js");
const { isValidInputs } = require("../utility/input-validation.js");

const getToken = (email) => jwt.sign({ email }, process.env.JWT_PWD);

exports.signUp = async (req, res) => {
  try {
    if (!isValidInputs(req.body, "signup")) {
      return res.status(400).send({ message: "Invalid request made" });
    }

    const { email, password, phone } = req.body;

    const isUser = await User.findOne({ email: email });

    if (isUser) {
      return res.status(409).send({ message: "Email Id already exist" });
    }

    bcrypt.hash(password, 10, async (err, hash) => {
      if (err) throw new Error(err);
      const newUser = new User({ email: email, password: hash, phone: phone });
      await newUser.save();
      return res.status(201).send({ message: "User created successfully" });
    });
  } catch (err) {
    res.status(501).send({ message: "Error creating user" });
  }
};

exports.signIn = async (req, res) => {
  try {
    if (!isValidInputs(req.body, "signin")) {
      return res.status(400).send({ message: "Invalid request made" });
    }

    const { email, password } = req.body;

    const isUser = await User.findOne({ email: email });

    if (!isUser) {
      return res.status(401).send({ message: "EmailId doesn't exist" });
    }

    bcrypt.compare(password, isUser.password, (err, result) => {
      if (err) throw new Error(err);

      if (!result) {
        return res.status(401).send({ message: "Password doesn't match" });
      }

      return res.status(200).send({
        authKey: getToken(isUser.email),
        message: "User logged in Successfully",
      });
    });
  } catch (err) {
    res.status(401).send({ message: err.message });
  }
};

exports.isSignedIn = (req, res, next) => {
  // Control reaching this function means user already logged in & can be sent 200(OK) response
  res.status(200).send({ message: "User authorized successfully" });
};
