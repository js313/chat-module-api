const { Groups, Members, Users } = require("../config/db");

const updateOnlineGroups = async (socket, io) => {
  try {
    const groupsList = await getGroupList(socket);
    io.emit("groupList", groupsList);
  } catch (error) {
    console.log(error);
  }
};

const getGroupList = async (socket) => {
  try {
    const members = await Members.findAll({
      where: { user_id: socket.user.id },
    });
    const groups = await Promise.all(
      members.map(async (element) => {
        const group = await Groups.findByPk(element.group_id, {
          include: {
            model: Users,
            through: Members,
            attributes: {
              exclude: ["password", "created_at", "updated_at"],
            },
          },
        });
        return group.get({ plain: true });
      })
    );
    return groups;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = { updateOnlineGroups };
