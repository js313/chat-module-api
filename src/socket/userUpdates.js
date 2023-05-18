const { Users, Conversations, Op } = require("../config/db");
const { connectedUsers } = require("./store");

const getConversationList = async (socket, io) => {
  try {
    console.log(socket.user.id);
    let conversations = await Conversations.findAll({
      where: {
        [Op.or]: [
          { receiver_id: socket.user.id },
          { sender_id: socket.user.id },
        ],
      },
      include: [
        { model: Users, as: "sender", attributes: { exclude: ["password"] } },
        { model: Users, as: "receiver", attributes: { exclude: ["password"] } },
      ],
    });

    let emitToMySockets = connectedUsers.get(socket.user.id) || [];
    let emitToOtherSockets = [];

    conversations = conversations.map((element) => {
      let conversation = element.get({ plain: true });
      if (conversation.sender_id === socket.user.id) {
        conversation.user = conversation.receiver;
        delete conversation.receiver;
      } else {
        conversation.user = conversation.sender;
        delete conversation.sender;
      }
      if (connectedUsers.has(conversation.user.id)) {
        conversation.user.online = true;
        emitToOtherSockets.push(
          ...(connectedUsers.get(conversation.user.id) || [])
        );
      } else {
        conversation.user.online = false;
      }
      return conversation;
    });
    emitToMySockets.forEach((socketId) => {
      io.to(socketId).emit("conversationList", conversations);
    });

    conversations = conversations.map((conversation) => {
      delete conversation.user;
      if (conversation.sender) {
        conversation.user = conversation.sender;
        delete conversation.sender;
      } else {
        conversation.user = conversation.receiver;
        delete conversation.receiver;
      }
      if (connectedUsers.has(conversation.user.id)) {
        conversation.user.online = true;
      } else {
        conversation.user.online = false;
      }
      return conversation;
    });
    emitToOtherSockets.forEach((socketId) => {
      io.to(socketId).emit("conversationList", conversations);
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { getConversationList };
