const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, getUser, removeUser, getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
    console.log("New connection made");

    socket.on('join', ({ userName, roomName }, callback) => {
        const { error, user } = addUser({ id: socket.id, userName, roomName });
        if (error) {
            return callback(error);
        }

        socket.join(user.roomName);

        socket.emit("message", generateMessage("Admin", `Welcome ${user.userName}!`));
        socket.broadcast.to(user.roomName).emit("message", generateMessage(`${user.userName} just joined!`));

        // update room user list
        io.to(user.roomName).emit("roomData", {
            roomName: user.roomName,
            users: getUsersInRoom(user.roomName),
        });

        // no args no error
        callback();

    });

    socket.on("newMessage", (message, callback) => {
        const filter = new Filter();
        if (filter.isProfane(message)) {
            callback("No profanity please");
            return;
        }
        // fetching user for roomName
        const user = getUser(socket.id);
        io.to(user.roomName).emit("message", generateMessage(user.userName, message));
        callback();

    });

    socket.on("sendLocation", (locationObj, callback) => {
        // fetching user for roomName
        const user = getUser(socket.id);
        io.to(user.roomName).emit("locationMessage", generateLocationMessage(user.userName, `https://google.com/maps?q=${locationObj["lat"]},${locationObj["long"]}`));
        callback();
    });

    socket.on("disconnect", () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.roomName).emit("message", generateMessage("Admin", `${user.userName} has left`));
            // update room user list
            io.to(user.roomName).emit("roomData", {
                roomName: user.roomName,
                users: getUsersInRoom(user.roomName),
            });
        }
    });
})

server.listen(port, () => {
    console.log(`server is up on port: ${port}`);
});

