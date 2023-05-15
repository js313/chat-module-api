const db = require("../../config/db");
const { Conversations } = db;
const message = require("../../utils/responseMessage");

exports.findAll = async (req, res) => {
  try {
    let conversation = await Conversations.findAll({
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
      data: conversation,
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
    const conversation = await Conversations.findByPk(req.params.id, {
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
    if (!conversation) {
      res.status(404).send({
        status: 404,
        message: message.error.get("conversations"),
      });
    } else {
      res.json({
        status: 200,
        data: conversation,
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
  let conv = req.body;

  try {
    const conversation = await Conversations.create(conv);
    res.status(201).json({
      status: 201,
      data: conversation,
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
    let conversation = await Conversations.findByPk(req.params.id);
    if (!conversation) {
      res.status(404).send({
        status: 404,
        message: message.error.update("conversations"),
      });
    } else {
      conversation = await conversation.update(req.body);
      res.status(201).json({
        status: 201,
        data: conversation,
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
    const conversation = await Conversations.findByPk(req.params.id);
    if (!conversation) {
      res.status(404).send({
        status: 404,
        message: message.error.remove("conversations"),
      });
    } else {
      await conversation.destroy();
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
