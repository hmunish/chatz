const path = require("path");

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const usersRouter = require("./routes/users.js");

const sequelize = require("./utility/database.js");

const app = express();

// Serving pages for public router
// app.use("/dist", (req, res) => {
//   res.sendFile(path.join(__dirname, `../dist${req.url}`));
// });

app.use(express.static("dist"));

// Using cors package to communicate between cross origin requests & allowing requests only from the application url
app.use(cors({ origin: "http://localhost", methods: ["GET", "POST"] }));

// Using body parser to parse incoming json body
app.use(bodyParser.json());

// Users router
app.use("/users", usersRouter);

// Responding with 404 not found error if no route matched by the request
app.use("/", (req, res) => {
  res.status(404).redirect("404.html");
});

sequelize
  .sync()
  .then(() => {
    app.listen(process.env.PORT || 3000);
  })
  .catch((err) => {
    console.log(err);
  });
