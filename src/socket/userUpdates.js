const { v4 } = require("uuid");
const { Users, Conversations, Op, Messages } = require("../config/db");
const { connectedUsers } = require("./store");

const getList = async (userId) => {
  let conversations = await Conversations.findAll({
    where: {
      [Op.or]: [{ receiver_id: userId }, { sender_id: userId }],
    },
    include: [
      { model: Users, as: "sender", attributes: { exclude: ["password"] } },
      { model: Users, as: "receiver", attributes: { exclude: ["password"] } },
    ],
  });

  conversations = conversations.map((element) => {
    let conversation = element.get({ plain: true });
    if (conversation.sender_id === userId) {
      conversation.user = conversation.receiver;
      conversation.user2 = conversation.sender;
    } else {
      conversation.user = conversation.sender;
      conversation.user2 = conversation.receiver;
    }
    delete conversation.sender;
    delete conversation.receiver;
    if (connectedUsers.has(conversation.user.id)) {
      conversation.user.online = true;
    } else {
      conversation.user.online = false;
    }
    return conversation;
  });

  return conversations;
};

const getConversationList = async (socket, io) => {
  try {
    let emitToMySockets = connectedUsers.get(socket.user.id) || [];

    let conversations = await getList(socket.user.id);

    emitToMySockets.forEach((socketId) => {
      io.to(socketId).emit("conversationList", conversations);
    });

    conversations.map(async (conversation) => {
      if (
        conversation.user.id !== socket.user.id &&
        connectedUsers.has(conversation.user.id)
      ) {
        let otherConversations = await getList(conversation.user.id);
        connectedUsers.get(conversation.user.id).forEach((socketId) => {
          io.to(socketId).emit("conversationList", otherConversations);
        });
      }
    });
  } catch (error) {
    const errorCode = 500;
    const errorMessage = "Something went wrong!";
    socket.emit("error", { errorCode, errorMessage });
    console.log(error);
  }
};

const getConversation = async (socket, io, data) => {
  const { conversation_id } = data;

  try {
    let conversation = await Conversations.findByPk(conversation_id, {
      include: [
        {
          model: Users,
          as: "sender",
          attributes: {
            exclude: ["password", "created_at", "updated_at"],
          },
        },
        {
          model: Users,
          as: "receiver",
          attributes: {
            exclude: ["password", "created_at", "updated_at"],
          },
        },
      ],
    });
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    conversation = conversation.get({ plain: true });
    if (conversation.sender.id === socket.user.id) {
      conversation.sender = undefined;
      conversation.user = conversation.receiver;
      conversation.receiver = undefined;
    } else {
      conversation.receiver = undefined;
      conversation.user = conversation.sender;
      conversation.sender = undefined;
    }
    io.to(socket.id).emit("getConversation", conversation);
  } catch (error) {
    const errorCode = 500;
    const errorMessage = "Something went wrong!";
    socket.emit("error", { errorCode, errorMessage });
    console.log(error);
  }
};

const createConversation = async (socket, io, data) => {
  try {
    const { receiver_id } = data;
    const sender = await Users.findOne({ where: { id: socket.user.id } });
    if (!sender) {
      throw new Error("Sender not found");
    }
    const receiver = await Users.findOne({ where: { id: receiver_id } });
    if (!receiver) {
      throw new Error("Receiver not found");
    }
    const getConversation = await Conversations.findAll({
      where: { sender_id: receiver_id, receiver_id: socket.user.id },
    });

    // if (!getConversation) {
    const conversation = await Conversations.create({
      sender_id: socket.user.id,
      receiver_id: receiver_id,
    });
    return conversation;
    // }
  } catch (error) {
    const errorCode = 500;
    const errorMessage = "Something went wrong!";
    socket.emit("error", { errorCode, errorMessage });
    console.log(error);
  }
};

const deleteConversation = async (socket, io, data) => {
  const { conversation_id } = data;
  try {
    const user = await Users.findOne({
      where: { id: socket.user.id },
    });
    if (!user) {
      throw new Error("User not found");
    }

    const conversation = await Conversations.findOne({
      where: {
        id: conversation_id,
        [Op.or]: [
          { receiver_id: socket.user.id },
          { sender_id: socket.user.id },
        ],
      },
    });

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    await Messages.destroy({
      where: { conversation_id: conversation.id },
    });

    await conversation.destroy();
  } catch (error) {
    const errorCode = 500;
    const errorMessage = "Something went wrong!";
    socket.emit("error", { errorCode, errorMessage });
    console.log(error);
  }
};

module.exports = {
  getConversationList,
  getConversation,
  createConversation,
  deleteConversation,
};
