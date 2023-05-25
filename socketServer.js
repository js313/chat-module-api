const socketIO = require("socket.io");
const authSocket = require("./src/middlewares/authSocket");
const {
  addUserToStore,
  removeUserFromStore,
  connectedUsers,
} = require("./src/socket/store");
const {
  getConversationList,
  createConversation,
} = require("./src/socket/userUpdates");
const {
  getGroupList,
  createGroup,
  addMemberInGroup,
} = require("./src/socket/groupUpdates");
const {
  getAllMessage,
  sendMessage,
  deleteMessage,
} = require("./src/socket/messageUpdates");

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

    socket.on("conversationList", async () => {
      getConversationList(socket, io);
    });
    getGroupList(socket, io);
    socket.on("createConversation", async (data) => {
      const conversation = await createConversation(socket, io, data);
      if (conversation) {
        io.to(socket.id).emit("createConversation", conversation);
        connectedUsers.get(conversation.receiver_id)?.forEach((socketId) => {
          io.to(socketId).emit("createConversation", conversation);
          // getConversationList(socket, io);
        });
      }
    });
    socket.on("groupList", async () => {
      await getGroupList(socket, io);
    });
    socket.on("addMember", async (data) => {
      await addMemberInGroup(socket, io, data);
      socket.emit("groupList");
    });
    socket.on("messages", async (data) => {
      let message = await getAllMessage(socket, data);
      io.to(socket.id).emit("messages", message);
    });
    socket.on("deleteMessage", async (data) => {
      await deleteMessage(socket, io, data);
    });
    socket.on("createGroup", async (data) => {
      let group = await createGroup(socket, io, data);
      io.to(socket.id).emit("createGroup", group);
      try {
        await getGroupList(socket, io);
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("sendMessage", async (data) => {
      let socketIds = await sendMessage(socket, io, data);
      let message = await getAllMessage(socket, data);
      socketIds.forEach((id) => {
        io.to(id).emit("messages", message);
      });
    });
    socket.on("disconnect", async () => {
      removeUserFromStore(socket.user.id, socket.id);
      getConversationList(socket, io);
      console.log("Client disconnected");
    });
  });
};

module.exports = { registerSocketServer };
