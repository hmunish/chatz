const path = require("path");

require("dotenv").config();

const express = require("express");

const sequelize = require("./utility/database");

const app = express();

// Serving pages for public router
app.use("/public", (req, res) => {
  res.sendFile(path.join(__dirname, `../public${req.url}`));
});

// 404 not found error
app.use("/", (req, res) => {
  res.status(404).sendFile(path.join(__dirname, "../public/404.html"));
});

sequelize
  .sync()
  .then(() => {
    app.listen(process.env.PORT || 3000);
  })
  .catch((err) => {
    console.log(err);
  });
