const { Groups, Members, Users } = require("../config/db");

const getGroupList = async (socket, io) => {
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
    io.to(socket.id).emit("groupList", groups);
  } catch (error) {
    console.log(error);
  }
};

module.exports = { getGroupList };
