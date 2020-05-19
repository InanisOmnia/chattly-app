// Setup basic express server
const port = process.env.PORT || 3000
const express = require('express');
const app = express();
const server = app.listen(port, () => {
  console.log(`Server listening at port ${port}`);
});
const io = require('socket.io')(server);
const path = require('path');
// Routing
app.use(express.static(path.join(__dirname, 'public')));

const bodyParser = require("body-parser");
const path = require('path');
const cors = require('cors');
const expressLayouts = require("express-ejs-layouts");

// Setup Server
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middlewares
const middlewares = [
cors(),
expressLayouts,
bodyParser.urlencoded({	extended: false}),
];
const statics = [
  express.static(path.join(__dirname, "public"))
];
  
app.use(middlewares);
app.use(statics);


// Routing
app.get("/", (req, res) => {
  res.render("index");
});

// Chatroom
var numUsers = 0;

io.on('connection', (socket) => {
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', (data) => {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', (username) => {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', () => {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', () => {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', () => {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});
