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
  deleteConversation,
} = require("./src/socket/userUpdates");
const {
  getGroupList,
  createGroup,
  addMemberInGroup,
  updateGroup,
  deleteGroup,
} = require("./src/socket/groupUpdates");
const {
  getAllMessage,
  sendMessage,
  deleteMessage,
  updateMessage,
  forwardMessage,
} = require("./src/socket/messageUpdates");
const { blockUser, unblockUser } = require("./src/socket/blockUpdates");
const {
  getGroupMembers,
  updateMembers,
} = require("./src/socket/memberUpdates");
const {
  getUnseenMessages,
  deleteUnseenMessages,
} = require("./src/socket/unseenMessageUpdates");

let io = null;
let socket = null;

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
  io.on("connection", async (s) => {
    socket = s;
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
    socket.on("memberList", async (data) => {
      await getGroupMembers(socket, io, data);
    });
    socket.on("updateMember", async (data) => {
      await updateMembers(socket, io, data);
      socket.emit("groupList");
    });
    socket.on("messages", async (data) => {
      let message = await getAllMessage(socket, data);
      io.to(socket.id).emit("messages", message);
    });
    socket.on("deleteMessage", async (data) => {
      await deleteMessage(socket, io, data);
    });
    socket.on("updateMessage", async (data) => {
      await updateMessage(socket, io, data);
    });
    socket.on("deleteConversation", async (data) => {
      await deleteConversation(socket, io, data);
    });
    socket.on("blockUser", async (data) => {
      await blockUser(socket, io, data);
    });
    socket.on("unBlockUser", async (data) => {
      await unblockUser(socket, io, data);
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
    socket.on("updateGroup", async (data) => {
      await updateGroup(socket, io, data);
    });
    socket.on("deleteGroup", async (data) => {
      await deleteGroup(socket, io, data);
    });

    socket.on("sendMessage", async (data) => {
      let socketIds = await sendMessage(socket, io, data);
      // let message = await getAllMessage(socket, data);
      // socketIds.forEach((id) => {
      //   io.to(id).emit("messages", message);
      // });
    });
    socket.on("forwardMessage", async (data) => {
      await forwardMessage(socket, io, data);
    });
    socket.on("getUnseenMessages", async (data) => {
      await getUnseenMessages(socket, io, data);
    });
    socket.on("deleteUnseenMessages", async (data) => {
      await deleteUnseenMessages(socket, io, data);
    });

    socket.on("disconnect", async () => {
      removeUserFromStore(socket.user.id, socket.id);
      getConversationList(socket, io);
      console.log("Client disconnected");
    });
  });
};

const sendMessageSocket = async (data) => {
  if (socket) {
    await sendMessage(socket, io, data);
  }
};

module.exports = { registerSocketServer, sendMessageSocket };
