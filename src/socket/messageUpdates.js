const {
  Messages,
  Conversations,
  Members,
  Users,
  sequelize,
  Op,
  UnseenMessages,
} = require("../config/db");
const { handleSocketError } = require("../utils/socketErrorMessage");
const { uploadFile } = require("../utils/uploadFile");
const { broadcastToConversation, broadcastToGroup } = require("./broadcast");
const { connectedUsers } = require("./store");
const fs = require("fs");

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
        "files",
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
    handleSocketError(io, error);
  }
};

const sendMessage = async (socket, io, data) => {
  try {
    const { conversation_id, group_id, text, files, req } = data;

    // const uploadPromises = files.map((file) => {
    //   return cloudinary.uploader.upload(file.path, { resource_type: "auto" });
    // });

    // const results = await Promise.all(uploadPromises);
    // const filesUrl = results.map((result) => result.secure_url);
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
      conversation = await Conversations.findOne({
        where: {
          id: conversation_id,
          [Op.and]: [
            {
              [Op.or]: [
                { receiver_id: socket.user.id },
                { sender_id: socket.user.id },
              ],
            },
          ],
        },
      });
      if (!conversation) {
        throw new Error(
          "Conversation not found or you are not part of this conversation"
        );
      }
    } else {
      members = await Members.findAll({
        where: { group_id: group_id },
      });
      if (members?.length === 0) {
        throw new Error("You are not member of this group");
      }
    }

    if (!conversation && members?.length === 0) {
      throw new Error("not found");
    }
    let fileUrls = [];
    if (req) {
      fileUrls = await Promise.all(files.map((file) => uploadFile(file, req)));
    }

    let receiverIds = [];
    const newMessage = await Messages.create({
      conversation_id,
      group_id,
      text,
      files: fileUrls,
      sender_id: socket.user.id,
    });
    if (newMessage.conversation_id) {
      let user_id;
      if (conversation.receiver_id === socket.user.id) {
        user_id = conversation.sender_id;
      } else {
        user_id = conversation.receiver_id;
      }
      await UnseenMessages.create({
        user_id,
        message_id: newMessage.id,
      });
    } else {
      for (let i = 0; i < members.length; i++) {
        if (members[i].user_id !== socket.user.id) {
          await UnseenMessages.create({
            user_id: members[i].user_id,
            message_id: newMessage.id,
          });
        }
      }
    }

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
    data?.req.files.forEach((file) => {
      fs.unlink(file.path, (unlinkError) => {
        if (unlinkError) {
          throw new AppError(
            "Failed to delete the uploaded file:" + unlinkError.toString(),
            500
          );
        }
      });
    });
  }
};

const forwardMessage = async (socket, io, data) => {
  try {
    const { conversation_id, group_id, message_id } = data;

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
      conversation = await Conversations.findOne({
        where: {
          id: conversation_id,
          [Op.and]: [
            {
              [Op.or]: [
                { receiver_id: socket.user.id },
                { sender_id: socket.user.id },
              ],
            },
          ],
        },
      });
      if (!conversation) {
        throw new Error(
          "Conversation not found or you are not part of this conversation"
        );
      }
    } else {
      members = await Members.findAll({
        where: { group_id: group_id, user_id: socket.user.id },
      });
      if (members?.length === 0) {
        throw new Error("You are not member of this group");
      }
    }

    const originalMessage = await Messages.findByPk(message_id);
    if (!originalMessage) {
      throw new Error("Original message not found");
    }
    let receiverIds = [];
    const forwardedMessage = await Messages.create({
      conversation_id: conversation_id,
      group_id: group_id,
      text: originalMessage.text,
      files: originalMessage.files,
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
    handleSocketError(io, error);
  }
};

const updateMessage = async (socket, io, data) => {
  const { message_id, text } = data;
  try {
    const user = await Users.findOne({ where: { id: socket.user.id } });
    if (!user) {
      throw new Error("User not found");
    }
    const message = await Messages.findOne({
      where: { id: message_id, sender_id: socket.user.id },
    });

    if (!message) {
      return;
    }
    await message.update({ text: text });
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
    handleSocketError(io, error);
  }
};

const deleteMessage = async (socket, io, data) => {
  const { message_id } = data;
  try {
    const user = await Users.findOne({ where: { id: socket.user.id } });

    if (!user) {
      throw new Error("User not found");
    }
    const message = await Messages.findOne({
      where: { id: message_id, sender_id: socket.user.id },
    });
    if (!message) {
      return;
    }
    await message.update({ hidden: true });
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
    handleSocketError(io, error);
  }
};

module.exports = {
  getAllMessage,
  sendMessage,
  forwardMessage,
  updateMessage,
  deleteMessage,
};
