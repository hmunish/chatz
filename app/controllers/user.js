const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.js');
const {
  isValidInputs,
  sanitizeUserInput,
} = require('../utility/input-validation.js');
const chat = require('../models/chat.js');

const getToken = (email) => jwt.sign({ email }, process.env.JWT_PWD);

exports.signUp = async (req, res) => {
  try {
    if (!isValidInputs(req.body, 'signup')) {
      return res.status(400).send({ message: 'Invalid request made' });
    }

    const { email, password, phone } = req.body;

    const isUser = await User.findOne({ email });

    if (isUser) {
      return res.status(409).send({ message: 'Email Id already exist' });
    }

    bcrypt.hash(password, 10, async (err, hash) => {
      if (err) throw new Error(err);
      const newUser = new User({ email, password: hash, phone });
      await newUser.save();
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

    const isUser = await User.findOne({ email });

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

exports.isSignedIn = async (req, res, next) => {
  // Control reaching this function means user already logged in & can be sent 200(OK) response
  try {
    if (!isValidInputs(req.header('authKey'), 'authKey')) {
      return res.status(400).send({ message: 'Invalid request made' });
    }
    const token = req.header('authKey');

    if (!token) return res.status(401).send({ message: 'User not authorized' });

    const user = jwt.verify(token, process.env.JWT_PWD);

    const isUser = await User.findOne({ email: user.email })
      .select('email users')
      .populate({
        path: 'chats',
        select: 'users messages',
        options: {
          sort: [{ updatedAt: '-1' }],
        },
      });

    if (!isUser) {
      return res.status(401).send({ message: 'User not authorized' });
    }

    res.status(200).send({ user: isUser, message: 'User already authorized' });
  } catch (err) {
    console.log(err);
    res.status(501).send({ message: 'Error authorizing user' });
  }
};

// Search Users function

exports.searchUser = async (req, res) => {
  try {
    const searchQuery = sanitizeUserInput(req.body.searchQuery);
    if (!searchQuery) { return res.status(400).send({ message: 'Invalid request made' }); }
    const users = await User.find(
      { email: new RegExp(searchQuery) },
      'id email',
    );
    return res.send(users);
  } catch (err) {
    console.log(err);
    res.status(501).send({ message: 'Error searching user' });
  }
};
