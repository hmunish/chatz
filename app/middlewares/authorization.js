const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { isValidInputs } = require("../utility/input-validation");

exports.authorization = async (req, res, next) => {
  try {
    if (!isValidInputs(req.header("authKey"), "authKey")) {
      return res.status(400).send({ message: "Invalid request made" });
    }
    const token = req.header("authKey");

    if (!token) return res.status(401).send({ message: "User not authorized" });

    const user = jwt.verify(token, process.env.JWT_PWD);

    const isUser = await User.findOne({ email: user.email });

    if (!isUser) {
      return res.status(401).send({ message: "User not authorized" });
    }

    req.user = isUser;
    next();
  } catch (err) {
    console.log(err);
    res.status(501).send({ message: "Error authorizing user" });
  }
};
