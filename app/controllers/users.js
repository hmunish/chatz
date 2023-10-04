const sequelize = require("../utility/database.js");
const Users = require("../models/users.js");

exports.registerUser = async (req, res) => {
  try {
    console.log(req.body);
    res.status(201).send("User created successfully");
  } catch (err) {
    res.status(501).send("Error creating user");
  }
};
