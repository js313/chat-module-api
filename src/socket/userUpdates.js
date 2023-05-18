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
    let newData = [];
    conversations = conversations.map((data) => {
      data = data.get({ plain: true });
      if (data.sender_id !== socket.user.id) {
        data.userdata = data.sender;
      }

      if (data.receiver_id !== socket.user.id) {
        data.userdata = data.receiver;
      }
      delete data.receiver;
      delete data.sender;
      if (connectedUsers.has(data.userdata.id)) {
        data.userdata.online = true;
      } else {
        data.userdata.online = false;
      }
      newData.push(data);
    });
    socket.emit("conversationList", newData);
  } catch (error) {
    console.log(error);
  }
};

module.exports = { getConversationList };
