// const sequelize = require("../utility/database.js");
const Users = require("../models/users.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const getToken = (email) => {
  return jwt.sign({ email }, process.env.JWT_PWD);
};

exports.signUp = async (req, res) => {
  try {
    const { email, password, phone } = req.body;
    const isUser = await Users.findOne({ where: { email: email } });
    if (isUser)
      return res.status(409).send({ message: "Email Id already exist" });
    bcrypt.hash(password, 10, async (err, hash) => {
      if (err) throw new Error(err);
      await Users.create({ email, password: hash, phone });
      return res.status(201).send({ message: "User created successfully" });
    });
  } catch (err) {
    res.status(501).send({ message: "Error creating user" });
  }
};

exports.signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const isUser = await Users.findOne({ where: { email: email } });

    if (!isUser)
      return res.status(401).send({ message: "EmailId doesn't exist" });

    bcrypt.compare(password, isUser.password, (err, result) => {
      console.log(result);
      if (err) throw new Error(err);
      if (!result)
        return res.status(401).send({ message: "Password doesn't match" });
      res.status(200).send({
        authKey: getToken(isUser.email),
        message: "User logged in Successfully",
      });
    });
  } catch (err) {
    res.status(401).send({ message: err.message });
  }
};
