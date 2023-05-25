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

exports.broadcastToGroup = async (io, data, str, groupId) => {
  try {
    const members = await Members.findAll({
      where: { group_id: groupId },
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
