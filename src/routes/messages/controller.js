const db = require("../../config/db");
const { Messages } = db;
const rmessage = require("../../utils/responseMessage");

exports.findAll = async (req, res) => {
  try {
    let message = await Messages.findAll({
      include: [
        {
          model: db.Users,
          as: "sender",
          attributes: ["id", "name", "email"],
        },
        {
          model: db.Conversations,
          as: "conversation",
          attributes: ["id", "sender_id", "receiver_id"],
        },
      ],
    });
    res.json({
      status: 200,
      data: message,
      message: rmessage.success.get("messages"),
    });
  } catch (error) {
    res.status(500).send({
      status: 500,
      message: rmessage.error.get("messages"),
      error: error.message,
    });
  }
};

exports.findByPk = async (req, res) => {
  try {
    const message = await Messages.findByPk(req.params.id, {
      include: [
        {
          model: db.Users,
          as: "sender",
          attributes: ["id", "name", "email"],
        },
        {
          model: db.Conversations,
          as: "conversation",
          attributes: ["id", "sender_id", "receiver_id"],
        },
      ],
    });
    if (!message) {
      res.status(404).send({
        status: 404,
        message: rmessage.error.get("messages"),
      });
    } else {
      res.json({
        status: 200,
        data: message,
        message: rmessage.success.get("messages"),
      });
    }
  } catch (error) {
    res.status(500).send({
      status: 500,
      message: rmessage.error.get("messages"),
      error: error.message,
    });
  }
};

exports.create = async (req, res) => {
  try {
    const message = await Messages.create(req.body);
    res.status(201).json({
      status: 201,
      data: message,
      message: rmessage.success.create("messages"),
    });
  } catch (error) {
    res.status(500).send({
      status: 500,
      message: rmessage.error.create("messages"),
      error: error.message,
    });
  }
};

exports.update = async (req, res) => {
  try {
    let message = await Messages.findByPk(req.params.id);
    if (!message) {
      res.status(404).send({
        status: 404,
        message: rmessage.error.update("messages"),
      });
    } else {
      message = await message.update(req.body);
      res.status(201).json({
        status: 201,
        data: message,
        message: rmessage.success.update("messages"),
      });
    }
  } catch (error) {
    res.status(500).send({
      status: 500,
      message: rmessage.error.update("messages"),
      error: error.message,
    });
  }
};

exports.destroy = async (req, res) => {
  try {
    const message = await Messages.findByPk(req.params.id);
    if (!message) {
      res.status(404).send({
        status: 404,
        message: rmessage.error.remove("messages"),
      });
    } else {
      await message.destroy();
      res.json({
        status: 200,
        message: rmessage.success.remove("messages"),
      });
    }
  } catch (error) {
    res.status(500).send({
      status: 500,
      message: rmessage.error.remove("messages"),
      error: error.message,
    });
  }
};
