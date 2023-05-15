const db = require("../../config/db");
const { Groups } = db;
const message = require("../../utils/responseMessage");

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
  try {
    const group = await Groups.findByPk(req.params.id);
    if (!group) {
      res.status(404).send({
        status: 404,
        message: message.error.get("groups"),
      });
    } else {
      res.json({
        status: 200,
        data: group,
        message: message.success.get("groups"),
      });
    }
  } catch (error) {
    res.status(500).send({
      status: 500,
      message: message.error.get("groups"),
      error: error.message,
    });
  }
};

exports.create = async (req, res) => {
  try {
    const group = await Groups.create(req.body);
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
