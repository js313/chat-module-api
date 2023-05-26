const db = require("../../config/db");
const { Groups, Users, Members } = db;
const message = require("../../utils/responseMessage");
const { uuid } = require("uuidv4");

exports.findAll = async (req, res) => {
  try {
    let group = await Groups.findAll();
    res.json({
      status: 200,
      data: group,
      message: message.success.get("groups"),
    });
  } catch (error) {
    res.status(500).send({
      status: 500,
      message: message.error.get("groups"),
      error: error.message,
    });
  }
};

exports.findByPk = async (req, res) => {
  const { id } = req.params;
  try {
    const group = await Groups.findByPk(id, {
      include: {
        model: Users,
        through: Members,
        attributes: {
          exclude: ["password", "created_at", "updated_at"],
        },
      },
    });

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    return res.status(200).json(group);
  } catch (error) {
    console.log(error);
  }
};

exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    const link = `http://localhost:3000/chat/group/${uuid()}`;

    const group = await Groups.create({
      created_by: req.user.id,
      name,
      link,
    });
    await db.Members.create({
      group_id: group.id,
      user_id: req.user.id,
    });
    res.status(201).json({
      status: 201,
      data: group,
      message: message.success.create("groups"),
    });
  } catch (error) {
    res.status(500).send({
      status: 500,
      message: message.error.create("groups"),
      error: error.message,
    });
  }
};

exports.update = async (req, res) => {
  try {
    let group = await Groups.findByPk(req.params.id);
    if (!group) {
      res.status(404).send({
        status: 404,
        message: message.error.update("groups"),
      });
    } else {
      group = await group.update(req.body);
      res.status(201).json({
        status: 201,
        data: group,
        message: message.success.update("groups"),
      });
    }
  } catch (error) {
    res.status(500).send({
      status: 500,
      message: message.error.update("groups"),
      error: error.message,
    });
  }
};

exports.destroy = async (req, res) => {
  try {
    const group = await Groups.findByPk(req.params.id);
    if (!group) {
      res.status(404).send({
        status: 404,
        message: message.error.remove("groups"),
      });
    } else {
      await group.destroy();
      res.json({
        status: 200,
        message: message.success.remove("groups"),
      });
    }
  } catch (error) {
    res.status(500).send({
      status: 500,
      message: message.error.remove("groups"),
      error: error.message,
    });
  }
};

exports.getGroupByLink = async (req, res) => {
  try {
    const { link } = req.query;

    const user = await Users.findOne({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json("User not found");
    }
    const group = await Groups.findOne({ where: { link: link } });
    if (!group) {
      return res.status(404).json("There is no group with this link");
    } else {
      return res.status(201).json(group);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error,
    });
  }
};
