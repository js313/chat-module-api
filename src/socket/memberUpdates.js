const { Users, Groups, Members } = require("../config/db");
const { getGroups } = require("./groupUpdates");

const getGroupMembers = async (socket, io, data) => {
  const { group_id } = data;
  try {
    const user = await Users.findOne({ where: { id: socket.user.id } });
    if (!user) {
      throw new Error("User not found");
    }
    const group = await Groups.findOne({ where: { id: group_id } });
    if (!group) {
      throw new Error("Group not found");
    }
    const checkUserInMember = await Members.findOne({
      where: { group_id: group_id, user_id: socket.user.id },
    });
    if (!checkUserInMember) {
      throw new Error("User is not member of this group");
    }
    const members = await Groups.findByPk(group_id, {
      include: {
        model: Users,
        through: Members,
        attributes: {
          exclude: ["password", "created_at", "updated_at"],
        },
      },
    });
    io.to(socket.id).emit("memberList", members);
  } catch (error) {
    console.log(error);
  }
};

const updateMembers = async (socket, io, data) => {
  const { group_id, members: memberIds } = data;
  try {
    const user = await Users.findOne({ where: { id: socket.user.id } });
    if (!user) {
      throw new Error("User not found");
    }
    const group = await Groups.findOne({
      where: { id: group_id, created_by: socket.user.id },
    });
    if (!group) {
      throw new Error("Group not found or you are not group admin");
    }
    await Members.destroy({
      where: {
        group_id: group_id,
        user_id: memberIds,
      },
    });
    const members = await Members.findAll({
      where: { group_id: group_id },
    });
    members.forEach((member) => {
      getGroups(member.user_id, io);
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { getGroupMembers, updateMembers };
