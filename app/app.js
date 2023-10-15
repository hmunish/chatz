require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const bodyParser = require("body-parser");
const userRouter = require("./routes/user.js");
const chatRouter = require("./routes/chat.js");

io.on("connection", (socket) => {
  console.log("Socket connected");
});

// Serving static files from dist folder
app.use(express.static("dist"));

// Using cors package to communicate between cross origin requests
// And allowing requests only from the application url
app.use(cors({ origin: "http://localhost", methods: ["GET", "POST"] }));

// Using body parser to parse incoming json body
app.use(bodyParser.json());

// Users router
app.use("/users", userRouter);

// Chats router
app.use("/chats", chatRouter);

// Responding with 404 not found error if no route matched by the request
app.use("/", (req, res) => {
  res.status(404).redirect("404.html");
});

mongoose
  .connect(process.env.MONGODB_HOSTNAME)
  .then((res) => {
    console.log("Mongo DB Connected");
    server.listen(process.env.PORT || 3000);
  })
  .catch((err) => {
    console.log(err);
  });

// sequelize
//   .sync()
//   .then(() => {
//     app.listen(process.env.PORT || 3000);
//   })
//   .catch((err) => {
//     console.log(err);
//   });
