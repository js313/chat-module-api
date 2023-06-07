const { Conversations, Members } = require("../config/db");
const { connectedUsers } = require("./store");

exports.broadcastToConversation = async (io, data, str, conversationId) => {
  try {
    const conversation = await Conversations.findByPk(conversationId);
    connectedUsers.get(conversation.sender_id)?.forEach((socketId) => {
      io.to(socketId).emit(str, data);
    });
    connectedUsers.get(conversation.receiver_id)?.forEach((socketId) => {
      io.to(socketId).emit(str, data);
    });
  } catch (error) {
    console.log(error);
  }
};

exports.broadcastToGroup = async (io, data, str, group_id) => {
  try {
    const members = await Members.findAll({
      where: { group_id: group_id },
    });
    members.forEach((member) => {
      connectedUsers.get(member.user_id)?.forEach((socketId) => {
        io.to(socketId).emit(str, data);
      });
    });
  } catch (error) {
    console.log(error);
  }
};

exports.broadcastToUser = async (io, data, str, userId) => {
  try {
    const members = await Members.findAll({
      where: { user_id: userId },
    });
    members.forEach((member) => {
      connectedUsers.get(member.user_id)?.forEach((socketId) => {
        io.to(socketId).emit(str, data);
      });
    });
  } catch (error) {
    console.log(error);
  }
};
