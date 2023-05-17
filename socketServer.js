const socketIO = require("socket.io");
const authSocket = require("./src/middlewares/authSocket");
const {
  addUserToStore,
  removeUserFromStore,
  connectedUsers,
} = require("./src/socket/store");
const { Users, Op } = require("./src/config/db");

let io = null;

const registerSocketServer = (server) => {
  io = socketIO(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  io.use((socket, next) => {
    authSocket(socket, next);
  });
  io.on("connection", async (socket) => {
    console.log("New client connected: " + socket.id);
    addUserToStore(socket.user.id, socket.id);
    updateOnlineusers(socket);
    socket.on("test", (data) => {
      io.to(socket.id).emit("test", { msg: "pong" });
    });
    socket.on("disconnect", async () => {
      removeUserFromStore(socket.user.id, socket.id);
      updateOnlineusers(socket);
      console.log("Client disconnected");
    });
  });
};

const updateOnlineusers = async (socket) => {
  try {
    const users = await getUsersList(socket);
    io.emit("updateUsersList", users);
  } catch (error) {
    console.log(error);
  }
};

const getUsersList = async (socket) => {
  try {
    let users = await Users.findAll({
      attributes: { exclude: ["password"] },
    });
    users = users.map((user) => {
      return {
        ...user.dataValues,
        online: connectedUsers.has(user.id) ? true : false,
      };
    });
    return users;
  } catch (error) {
    console.log(error);
  }
};

module.exports = { registerSocketServer };
