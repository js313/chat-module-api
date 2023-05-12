const db = require("../../config/db");
const bcrypt = require("bcryptjs");
const { Conversations } = db;
const message = require("../../utils/responseMessage");

exports.findAll = async (req, res) => {
  try {
    let item = await Conversations.findAll({
      include: [
        {
          model: db.Users,
          as: "sender",
          attributes: ["id", "name", "email"],
        },
        {
          model: db.Users,
          as: "receiver",
          attributes: ["id", "name", "email"],
        },
      ],
    });
    res.json({
      status: 200,
      data: item,
      message: message.success.get("conversations"),
    });
  } catch (error) {
    res.status(500).send({
      status: 500,
      message: message.error.get("conversations"),
      error: error.message,
    });
  }
};

exports.findByPk = async (req, res) => {
  try {
    const item = await Conversations.findByPk(req.params.id, {
      include: [
        {
          model: db.Users,
          as: "sender",
          attributes: ["id", "name", "email"],
        },
        {
          model: db.Users,
          as: "receiver",
          attributes: ["id", "name", "email"],
        },
      ],
    });
    if (!item) {
      res.status(404).send({
        status: 404,
        message: message.error.get("conversations"),
      });
    } else {
      res.json({
        status: 200,
        data: item,
        message: message.success.get("conversations"),
      });
    }
  } catch (error) {
    res.status(500).send({
      status: 500,
      message: message.error.get("conversations"),
      error: error.message,
    });
  }
};

exports.create = async (req, res) => {
  let conversation = req.body;

  try {
    const item = await Conversations.create(conversation);
    res.status(201).json({
      status: 201,
      data: item,
      message: message.success.create("conversations"),
    });
  } catch (error) {
    res.status(500).send({
      status: 500,
      message: message.error.create("conversations"),
      error: error.message,
    });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await Conversations.findByPk(req.params.id);
    if (!item) {
      res.status(404).send({
        status: 404,
        message: message.error.update("conversations"),
      });
    } else {
      item = await item.update(req.body);
      res.status(201).json({
        status: 201,
        data: item,
        message: message.success.update("conversations"),
      });
    }
  } catch (error) {
    res.status(500).send({
      status: 500,
      message: message.error.update("conversations"),
      error: error.message,
    });
  }
};

exports.destroy = async (req, res) => {
  try {
    const item = await Conversations.findByPk(req.params.id);
    if (!item) {
      res.status(404).send({
        status: 404,
        message: message.error.remove("conversations"),
      });
    } else {
      await item.destroy();
      res.json({
        status: 200,
        message: message.success.remove("conversations"),
      });
    }
  } catch (error) {
    res.status(500).send({
      status: 500,
      message: message.error.remove("conversations"),
      error: error.message,
    });
  }
};
