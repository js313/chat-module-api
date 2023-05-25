const { Groups, Members, Users } = require("../config/db");
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
    const link = `http://localhost:3000/chat/group/${v4()}`;
    const group = await Groups.create({
      created_by: socket.user.id,
      name,
      link,
    });
    await Members.create({
      user_id: socket.user.id,
      group_id: group.id,
    });
    members.forEach((user_id) => {
      Members.create({
        user_id,
        group_id: group.id,
      });
    });
    return { group: group, members: members };
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getGroupList,
  addMemberInGroup,
  joinGroupWithLink,
  createGroup,
};
