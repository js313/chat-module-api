const { Messages, Conversations, Members } = require("../config/db");

const getAllMessage = async (socket, data) => {
  try {
    const { conversation_id, group_id } = data;
    const query = {};
    if (conversation_id) {
      const conversation = await Conversations.findByPk(conversation_id);
      if (
        conversation &&
        (conversation.sender_id === socket.user.id ||
          conversation.receiver_id === socket.user.id)
      ) {
        query.conversation_id = conversation_id;
      }
    } else {
      const member = await Members.findOne({
        group_id,
        user_id: socket.user.id,
      });
      if (member) {
        query.member = conversation_id;
      }
    }
    if (Object.keys(query).length === 0) {
      return [];
    }
    const messages = await Messages.findAll({ where: query });
    if (!messages) {
      throw new Error("Message not found");
    }
    return messages;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = { getAllMessage };
