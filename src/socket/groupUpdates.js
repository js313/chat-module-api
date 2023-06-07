const { Groups, Members, Users, Messages, Op } = require("../config/db");
const { broadcastToGroup, broadcastToUser } = require("./broadcast");
const { getGroupMembers } = require("./memberUpdates");
const { connectedUsers } = require("./store");
const { v4 } = require("uuid");

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

const getGroups = async (userId, io) => {
  try {
    const members = await Members.findAll({
      where: { user_id: userId },
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
    connectedUsers.get(userId)?.forEach((socketId) => {
      io.to(socketId).emit("groupList", groups);
    });
  } catch (error) {
    console.log(error);
  }
};

const getGroup = async (socket, io, data) => {
  const { group_id } = data;
  try {
    const group = await Groups.findOne({
      where: { id: group_id },
    });
    if (!group) {
      throw new Error("Group not found by this link");
    }
    const checkUserInMember = await Members.findOne({
      where: { group_id: group.id, user_id: socket.user.id },
    });
    if (!checkUserInMember) {
      throw new Error("User is not a member of this group");
    }
    const members = await Groups.findByPk(group.id, {
      include: {
        model: Users,
        through: Members,
        attributes: {
          exclude: ["password", "created_at", "updated_at"],
        },
      },
    });
    io.to(socket.id).emit("getGroup", members);
  } catch (error) {
    console.log(error);
  }
};

const addMemberInGroup = async (socket, io, data) => {
  try {
    const { user_id, group_id } = data;

    const group = await Groups.findOne({
      where: { id: group_id },
    });

    if (!group) {
      throw new Error("Error");
    }

    const member = await Members.findOne({
      where: { group_id, user_id },
    });

    if (member) {
      throw new Error("User already member of this group");
    }

    await Members.create({
      group_id: group_id,
      user_id,
    });

    const members = await Members.findAll({
      where: { group_id: group_id },
    });
    members.forEach((member) => {
      getGroups(member.user_id, io);
    });
    getGroup(socket, io, { link: group.link });
  } catch (error) {
    console.log(error);
  }
};

const joinGroupWithLink = async (socket, io, data) => {
  try {
    const { link } = data;
    const user = await Users.findOne({ where: { id: socket.user.id } });
    if (!user) {
      throw new Error("User not found");
    }
    const group = await Groups.findOne({ where: { link: link } });
    if (!group) {
      throw new Error("Group not found from this link");
    }
    const joinGroup = await Members.create({
      group_id: group.id,
      user_id: socket.user.id,
    });
    return joinGroup;
  } catch (error) {
    console.log(error);
  }
};

const createGroup = async (socket, io, data) => {
  try {
    const { name, members } = data;

    const group = await Groups.create({
      created_by: socket.user.id,
      name,
    });

    await Members.create({
      user_id: socket.user.id,
      group_id: group.id,
    });

    for (const user_id of members) {
      await Members.create({
        user_id,
        group_id: group.id,
      });
    }

    members.push(socket.user.id);

    for (const member of members) {
      const groupMembers = await Members.findAll({
        where: { user_id: member },
      });

      const groups = await Promise.all(
        groupMembers.map((group) => {
          return Groups.findByPk(group.group_id);
        })
      );

      connectedUsers.get(member)?.forEach((socketId) => {
        io.to(socketId).emit("groupList", groups);
      });
    }

    return { group, members };
  } catch (error) {
    console.log(error);
  }
};

const updateGroup = async (socket, io, data) => {
  const { group_id, name } = data;
  try {
    const group = await Groups.findOne({
      where: { id: group_id, created_by: socket.user.id },
    });
    if (!group) {
      throw new Error("Group not found or you are not group admin");
    } else {
      await group.update({
        name: name,
      });
    }
    const members = await Members.findAll({
      where: { group_id: group_id },
    });
    members.forEach((member) => {
      getGroups(member.user_id, io);
    });
    getGroup(socket, io, { group_id });
  } catch (error) {
    console.log(error);
  }
};

const deleteGroup = async (socket, io, data) => {
  const { group_id } = data;
  try {
    const group = await Groups.findOne({
      where: { id: group_id, created_by: socket.user.id },
    });
    if (!group) {
      throw new Error("Group not found or you are not group admin");
    }
    await Messages.destroy({
      where: { group_id: group_id },
    });

    const members = await Members.findAll({ where: { group_id: group_id } });

    await Members.destroy({
      where: { group_id: group_id },
    });
    await group.destroy();

    members.map(async (member) => {
      const groupIds = await Members.findAll({
        where: { user_id: member.user_id },
      });
      let groups = await Promise.all(
        groupIds.map((groupId) => {
          return Groups.findByPk(groupId.group_id);
        })
      );
      connectedUsers.get(member.user_id)?.forEach((socketId) => {
        io.to(socketId).emit("groupList", groups);
      });
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getGroupList,
  addMemberInGroup,
  joinGroupWithLink,
  createGroup,
  getGroups,
  getGroup,
  updateGroup,
  deleteGroup,
};
