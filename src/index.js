
//Pretty format --> ctrl-shift+I

// START
//nodemon src/app.js -e js,hbs

//HEROKU init
// MAC --> brew tap heroku/brew && brew install heroku
// heroku login
// heroku create APP_NAME --> heroku create sherdg-task-app

//HEROKU
// git add --> commit --> push
// git push heroku appMain:main (appMain - branch name in Git) --> git push heroku main

// socket.emit              --> Visible for specific user
// io.emit                  --> Visible for everybody
// socket.broadcast.emit    --> Visible for all except current user

// io.to.emit               --> Visible for everybody in room
// socket.broadcast.to.emit --> Visible for all except current user only current room

const express = require("express");
const path = require("path");
const http = require("http");
const app = express();
const port = process.env.PORT || 3000
const publicDir = path.join(__dirname, "../public");
const server = http.createServer(app); // instead app.listen --> server.listen
const soketio = require("socket.io")
const io = soketio(server);
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');

const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

app.use(express.static(publicDir));

// let count = 0;
io.on('connection', (socket) => {
    console.log("New websocket.");
    // socket.emit('message', "Welcome!"); //Version 1.0

    //Version 2.0
    // socket.emit('message', {
    //     message: "Welcome!",
    //     createdAt: new Date().getTime()
    // });

    //Version 3.0
    // socket.emit('message', generateMessage("Welcome!"));
    // socket.broadcast.emit('message', generateMessage("A new user joined!!")); //visible for all except current tab



    // socket.emit('countUpdated', count);

    // socket.on('increment', () => {
    //     count++;
    //     // socket.emit('countUpdated', count); // --> working only in one tab
    //     io.emit('countUpdated', count); // // --> working only in several tabs
    // });

    socket.on('join', ({ username, room }, callback) => {

        const { error, user } = addUser({ id: socket.id, username, room }) //  error, user  будут полчены из user.js

        if (error) {
            return callback(error)
        }

        socket.join(user.room);
        // socket.join(room);
        // console.log(username);

        //Version 3.0
        socket.emit('message', generateMessage("Admin", "Welcome!"));
        socket.broadcast.to(user.room).emit('message', generateMessage("Admin", `${user.username} has joined.`)); //visible for all except current tab

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
         })


        callback();
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        const filter = new Filter();
        if (filter.isProfane(message)) {
            return callback("Profanity is not allowed!")
        }
        io.to(user.room).emit('message', generateMessage(user.username, message));
        callback("Message delivered!")

    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMessage("Admin", `${user.username} left!`));

            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
             })
        }
        // io.emit('message', generateMessage('A user left!'));
    });

    socket.on('sendLocation', (position, callback) => {

        // io.emit('message', `Location ${position.latitude}, ${position.longitude}`);
        // io.emit('locationMessage', `http://google.com/maps?q=${position.latitude},${position.longitude}`);

        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `http://google.com/maps?q=${position.latitude},${position.longitude}`));
        callback("Location shared!");
    });
});

// app.listen(port, () => {
//     console.log("Server started on port "+port)
// });

server.listen(port, () => {
    console.log("Server started on port " + port)
});