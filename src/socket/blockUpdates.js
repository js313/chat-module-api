const { Users, Groups, Members, BlockedUsers } = require("../config/db");
const { handleSocketError } = require("../utils/socketErrorMessage");
const { getGroups, getGroup } = require("./groupUpdates");

const blockUser = async (socket, io, data) => {
  const { group_id, user_id } = data;

  try {
    const user = await Users.findByPk(user_id);
    if (!user) {
      throw new Error("User not found");
    }

    const group = await Groups.findOne({
      where: { id: group_id, created_by: socket.user.id },
    });
    if (!group) {
      throw new Error("Group not found or you are not allowed to block user");
    }

    const member = await Members.findOne({
      where: { group_id, user_id },
    });
    if (!member) {
      throw new Error("Member not found");
    }

    await member.update({ muted: true });

    await BlockedUsers.create({
      blocker_id: socket.user.id,
      blocked_id: user_id,
    });

    const members = await Members.findAll({
      where: { group_id },
    });
    const userIds = members.map((member) => member.user_id);
    userIds.forEach((userId) => getGroups(userId, io));

    getGroup(socket, io, { group_id });
  } catch (error) {
    handleSocketError(io, error);
  }
};

const unblockUser = async (socket, io, data) => {
  const { group_id, user_id } = data;

  try {
    const user = await Users.findByPk(user_id);
    if (!user) {
      throw new Error("User not found");
    }

    const group = await Groups.findOne({
      where: { id: group_id, created_by: socket.user.id },
    });
    if (!group) {
      throw new Error("Group not found or you are not allowed to unblock user");
    }

    const getBlockUser = await BlockedUsers.findOne({
      where: { blocker_id: socket.user.id, blocked_id: user_id },
    });
    if (!getBlockUser) {
      throw new Error("User not found in block list");
    }

    const member = await Members.findOne({
      where: { group_id, user_id },
    });
    if (!member) {
      throw new Error("Member not found");
    }

    await member.update({ muted: false });
    await getBlockUser.destroy();

    const members = await Members.findAll({
      where: { group_id },
    });
    const userIds = members.map((member) => member.user_id);
    userIds.forEach((userId) => getGroups(userId, io));

    getGroup(socket, io, { group_id });
  } catch (error) {
    handleSocketError(io, error);
  }
};

module.exports = { blockUser, unblockUser };
