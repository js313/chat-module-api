const db = require("../../config/db");
const { BlockedUsers } = db;
const message = require("../../utils/responseMessage");

exports.findAll = async (req, res) => {
  try {
    let blockedUser = await BlockedUsers.findAll({
      include: [
        {
          model: db.Users,
          as: "blocked",
          attributes: ["id", "name", "email"],
        },
        {
          model: db.Users,
          as: "blocker",
          attributes: ["id", "name", "email"],
        },
      ],
    });
    res.json({
      status: 200,
      data: blockedUser,
      message: message.success.get("users"),
    });
  } catch (error) {
    res.status(500).send({
      status: 500,
      message: message.error.get("users"),
      error: error.message,
    });
  }
};

exports.findByPk = async (req, res) => {
  try {
    const blockedUser = await BlockedUsers.findByPk(req.params.id, {
      include: [
        {
          model: db.Users,
          as: "blocked",
          attributes: ["id", "name", "email"],
        },
        {
          model: db.Users,
          as: "blocker",
          attributes: ["id", "name", "email"],
        },
      ],
    });
    if (!blockedUser) {
      res.status(404).send({
        status: 404,
        message: message.error.get("users"),
      });
    } else {
      res.json({
        status: 200,
        data: blockedUser,
        message: message.success.get("users"),
      });
    }
  } catch (error) {
    res.status(500).send({
      status: 500,
      message: message.error.get("users"),
      error: error.message,
    });
  }
};

exports.create = async (req, res) => {
  try {
    const blockedUser = await BlockedUsers.create(req.body);
    res.status(201).json({
      status: 201,
      data: blockedUser,
      message: message.success.create("users"),
    });
  } catch (error) {
    res.status(500).send({
      status: 500,
      message: message.error.create("users"),
      error: error.message,
    });
  }
};

exports.update = async (req, res) => {
  try {
    let blockedUser = await BlockedUsers.findByPk(req.params.id);
    if (!blockedUser) {
      res.status(404).send({
        status: 404,
        message: message.error.update("users"),
      });
    } else {
      blockedUser = await blockedUser.update(req.body);
      res.status(201).json({
        status: 201,
        data: blockedUser,
        message: message.success.update("users"),
      });
    }
  } catch (error) {
    res.status(500).send({
      status: 500,
      message: message.error.update("users"),
      error: error.message,
    });
  }
};

exports.destroy = async (req, res) => {
  try {
    const blockedUser = await BlockedUsers.findByPk(req.params.id);
    if (!blockedUser) {
      res.status(404).send({
        status: 404,
        message: message.error.remove("users"),
      });
    } else {
      await blockedUser.destroy();
      res.json({
        status: 200,
        message: message.success.remove("users"),
      });
    }
  } catch (error) {
    res.status(500).send({
      status: 500,
      message: message.error.remove("users"),
      error: error.message,
    });
  }
};
