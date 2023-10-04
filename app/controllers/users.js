const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Users = require('../models/users.js');
const { isValidInputs } = require('../utility/input-validation.js');

const getToken = (email) => jwt.sign({ email }, process.env.JWT_PWD);

exports.signUp = async (req, res) => {
  try {
    if (!isValidInputs(req.body, 'signup')) {
      return res.status(400).send({ message: 'Invalid request made' });
    }

    const { email, password, phone } = req.body;

    const isUser = await Users.findOne({ where: { email } });

    if (isUser) {
      return res.status(409).send({ message: 'Email Id already exist' });
    }

    bcrypt.hash(password, 10, async (err, hash) => {
      if (err) throw new Error(err);
      await Users.create({ email, password: hash, phone });
      return res.status(201).send({ message: 'User created successfully' });
    });
  } catch (err) {
    res.status(501).send({ message: 'Error creating user' });
  }
};

exports.signIn = async (req, res) => {
  try {
    if (!isValidInputs(req.body, 'signin')) {
      return res.status(400).send({ message: 'Invalid request made' });
    }

    const { email, password } = req.body;

    const isUser = await Users.findOne({ where: { email } });

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
        message: 'User logged in Successfully',
      });
    });
  } catch (err) {
    res.status(401).send({ message: err.message });
  }
};

exports.isSignedIn = (req, res, next) => {
  // Control reaching this function means user already logged in & can be sent 200(OK) response
  res.status(200).send({ message: 'User authorized successfully' });
};
