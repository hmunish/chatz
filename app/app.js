const express = require("express");

const app = express();

require("dotenv").config();

app.use("/", (req, res) => {
  res.send("recieved");
});

app.listen(3000);
