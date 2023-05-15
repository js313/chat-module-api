const socketIO = require("socket.io");
const authSocket = require("./src/middlewares/authSocket");

let io = null;

const registerSocketServer = (server) => {
  io = socketIO(server, {
    cors: {
      origin: "http://localhost:4001",
      methods: ["GET", "POST"],
    },
  });
  io.use((socket, next) => {
    authSocket(socket, next);
  });

  io.on("connection", async (socket) => {
    console.log("New client connected: " + socket.id);
    socket.on("test", (data) => {
      io.to(socket.id).emit("test", { msg: "pong" });
    });
    socket.on("disconnect", async () => {
      console.log("Client disconnected");
    });
  });
};

module.exports = { registerSocketServer };
