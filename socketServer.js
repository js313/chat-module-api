const socketIO = require("socket.io");
const authSocket = require("./src/middlewares/authSocket");
const { addUserToStore, removeUserFromStore } = require("./src/socket/store");
const { getConversationList } = require("./src/socket/userUpdates");
const { updateOnlineGroups } = require("./src/socket/groupUpdates");
const { getAllMessage } = require("./src/socket/messageUpdates");

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
    getConversationList(socket, io);
    updateOnlineGroups(socket, io);
    socket.on("messages", async (data) => {
      let message = await getAllMessage(socket, data);
      io.to(socket.id).emit("messages", message);
    });
    socket.on("test", (data) => {
      io.to(socket.id).emit("test", { msg: "pong" });
    });
    socket.on("disconnect", async () => {
      removeUserFromStore(socket.user.id, socket.id);
      getConversationList(socket, io);
      console.log("Client disconnected");
    });
  });
};

module.exports = { registerSocketServer };
