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
      message: message.success.get("blocked_user"),
    });
  } catch (error) {
    res.status(500).send({
      status: 500,
      message: message.error.get("blocked_user"),
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
        message: message.error.get("blocked_user"),
      });
    } else {
      res.json({
        status: 200,
        data: blockedUser,
        message: message.success.get("blocked_user"),
      });
    }
  } catch (error) {
    res.status(500).send({
      status: 500,
      message: message.error.get("blocked_user"),
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
      message: message.success.create("blocked_user"),
    });
  } catch (error) {
    res.status(500).send({
      status: 500,
      message: message.error.create("blocked_user"),
      error: error.message,
    });
  }
};

exports.update = async (req, res) => {
  try {
    const blockedUser = await BlockedUsers.findByPk(req.params.id);
    if (!blockedUser) {
      res.status(404).send({
        status: 404,
        message: message.error.update("blocked_user"),
      });
    } else {
      blockedUser = await blockedUser.update(req.body);
      res.status(201).json({
        status: 201,
        data: blockedUser,
        message: message.success.update("blocked_user"),
      });
    }
  } catch (error) {
    res.status(500).send({
      status: 500,
      message: message.error.update("blocked_user"),
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
        message: message.error.remove("blocked_user"),
      });
    } else {
      await blockedUser.destroy();
      res.json({
        status: 200,
        message: message.success.remove("blocked_user"),
      });
    }
  } catch (error) {
    res.status(500).send({
      status: 500,
      message: message.error.remove("blocked_user"),
      error: error.message,
    });
  }
};
