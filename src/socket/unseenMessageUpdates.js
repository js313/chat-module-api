const { UnseenMessages } = require("../config/db");
const { handleSocketError } = require("../utils/socketErrorMessage");

const getUnseenMessages = async (socket, io, data) => {
  try {
    const unseenMessages = await UnseenMessages.findAll({
      where: { user_id: socket.user.id },
      attributes: { exclude: ["id", "user_id", "created_at", "updated_at"] },
    });
    if (!unseenMessages) {
      throw new Error("Unseen messages not found");
    }
    io.to(socket.id).emit("getUnseenMessages", unseenMessages);
  } catch (error) {
    handleSocketError(io, error);
  }
};

const deleteUnseenMessages = async (socket, io, data) => {
  const { message_id } = data;
  try {
    const unseenMessages = await UnseenMessages.findOne({
      where: { user_id: socket.user.id, message_id: message_id },
    });
    if (!unseenMessages) {
      throw new Error("Unseen messages not found");
    }
    await unseenMessages.destroy();
  } catch (error) {
    handleSocketError(io, error);
  }
};

module.exports = { getUnseenMessages, deleteUnseenMessages };
