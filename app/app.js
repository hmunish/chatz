const fs = require('fs');
const path = require('path');

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const http = require('http');

const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');

const io = new Server(server);

const bodyParser = require('body-parser');
const userRouter = require('./routes/user.js');
const chatRouter = require('./routes/chat.js');
const groupChatRouter = require('./routes/group-chat.js');

io.on('connection', (socket) => {
  socket.on('join-group', (groupId) => {
    socket.join(groupId);
  });
});

// Setting IO instance on every incoming request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Serving static files from dist folder
app.use(express.static('dist'));

// Using cors package to communicate between cross origin requests
// And allowing requests only from the application url
app.use(cors({ origin: process.env.HOSTNAME, methods: ['GET', 'POST'] }));

// Using body parser to parse incoming json body
app.use(bodyParser.json());

// Users router
app.use('/users', userRouter);

// Chats router
app.use('/chats', chatRouter);

// Groups router
app.use('/groups', groupChatRouter);

// Responding with 404 not found error if no route matched by the request
app.use('/', (req, res) => {
  res.status(404).redirect('404.html');
});

// create a write stream for error logs (in append mode)
const errorLogStream = fs.createWriteStream(
  path.join(__dirname, 'logs/error.log'),
  {
    flags: 'a',
  },
);

// setup the logger for error
app.use(
  morgan('combined', {
    skip(req, res) {
      return res.statusCode < 400;
    },
    stream: errorLogStream,
  }),
);

// create a write stream for success logs (in append mode)
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'logs/access.log'),
  {
    flags: 'a',
  },
);

// setup the logger for success logs
app.use(
  morgan('combined', {
    skip(req, res) {
      return res.statusCode > 400;
    },
    stream: accessLogStream,
  }),
);

// Setting up database connection with MongoDB server using mongoose ORM
mongoose
  .connect(process.env.MONGODB_HOSTNAME)
  .then((res) => {
    server.listen(process.env.PORT || 3000);
  })
  .catch((err) => {});
