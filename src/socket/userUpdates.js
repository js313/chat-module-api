const { Users } = require("../config/db");
const { connectedUsers } = require("./store");

const updateOnlineUsers = async (io) => {
  try {
    const users = await getUsersList();
    io.emit("usersList", users);
  } catch (error) {
    console.log(error);
  }
};

const getUsersList = async () => {
  try {
    let users = await Users.findAll({
      attributes: { exclude: ["password"] },
    });
    users = users.map((user) => {
      return {
        ...user.dataValues,
        online: connectedUsers.has(user.id) ? true : false,
      };
    });
    return users;
  } catch (error) {
    console.log(error);
  }
};

module.exports = { updateOnlineUsers };
