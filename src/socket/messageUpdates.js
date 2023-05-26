const {
  Messages,
  Conversations,
  Members,
  Groups,
  Users,
  sequelize,
} = require("../config/db");
const { broadcastToConversation, broadcastToGroup } = require("./broadcast");
const { connectedUsers } = require("./store");

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
        query.group_id = group_id;
      }
    }
    if (Object.keys(query).length === 0) {
      return [];
    }
    const messages = await Messages.findAll({
      where: query,
      attributes: [
        "id",
        "file",
        "hidden",
        "sender_id",
        "conversation_id",
        "group_id",
        "created_at",
        "updated_at",
        [
          sequelize.literal("CASE WHEN hidden = true THEN NULL ELSE text END"),
          "text",
        ],
      ],
    });

    if (!messages) {
      throw new Error("Message not found");
    }
    return messages;
  } catch (error) {
    console.log(error);
  }
};

const sendMessage = async (socket, io, data) => {
  try {
    const { conversation_id, group_id, text } = data;
    if (conversation_id && group_id) {
      throw new Error("error");
    }
    let checkBlockUser;
    if (group_id) {
      checkBlockUser = await Members.findOne({
        where: { group_id: group_id, user_id: socket.user.id, muted: true },
      });
    }
    if (checkBlockUser) {
      throw new Error("You are blocked in this group, you can't send messages");
    }
    let conversation;
    let members;
    if (conversation_id) {
      conversation = await Conversations.findByPk(conversation_id);
    } else {
      members = await Members.findAll({
        where: { group_id: group_id },
      });
    }
    if (!conversation && members?.length === 0) {
      throw new Error("not found");
    }

    let receiverIds = [];
    await Messages.create({
      conversation_id,
      group_id,
      text,
      sender_id: socket.user.id,
    });
    let allMessages = await getAllMessage(socket, {
      conversation_id: conversation_id,
      group_id: group_id,
    });
    if (conversation) {
      broadcastToConversation(io, allMessages, "messages", conversation_id);
    } else {
      broadcastToGroup(io, allMessages, "messages", group_id);
    }

    const senderIds = connectedUsers.get(socket.user.id) || [];
    return [...receiverIds, ...senderIds];
  } catch (error) {
    console.log(error);
  }
};

const updateMessage = async (socket, io, data) => {
  const { message_id, text } = data;
  try {
    const user = await Users.findOne({
      where: { id: socket.user.id },
    });
    if (!user) {
      throw new Error("User not found");
    }
    const message = await Messages.findOne({
      where: { id: message_id, sender_id: socket.user.id },
    });

    if (!message) {
      return;
    }
    await message.update({
      text: text,
    });
    let allMessages = await getAllMessage(socket, {
      conversation_id: message.conversation_id,
      group_id: message.group_id,
    });
    if (message.conversation_id) {
      broadcastToConversation(
        io,
        allMessages,
        "messages",
        message.conversation_id
      );
    } else {
      broadcastToGroup(io, allMessages, "messages", message.group_id);
    }
  } catch (error) {
    console.log(error);
  }
};

const deleteMessage = async (socket, io, data) => {
  const { message_id } = data;
  try {
    const user = await Users.findOne({
      where: { id: socket.user.id },
    });

    if (!user) {
      throw new Error("User not found");
    }
    const message = await Messages.findOne({
      where: { id: message_id, sender_id: socket.user.id },
    });
    if (!message) {
      return;
    }
    await message.update({
      hidden: true,
    });
    let allMessages = await getAllMessage(socket, {
      conversation_id: message.conversation_id,
      group_id: message.group_id,
    });
    if (message.conversation_id) {
      broadcastToConversation(
        io,
        allMessages,
        "messages",
        message.conversation_id
      );
    } else {
      broadcastToGroup(io, allMessages, "messages", message.group_id);
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = { getAllMessage, sendMessage, updateMessage, deleteMessage };
