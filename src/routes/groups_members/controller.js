const db = require("../../config/db");
const { Members } = db;
const message = require("../../utils/responseMessage");

exports.findAll = async (req, res) => {
  try {
    let member = await Members.findAll();
    res.json({
      status: 200,
      data: member,
      message: message.success.get("members"),
    });
  } catch (error) {
    res.status(500).send({
      status: 500,
      message: message.error.get("members"),
      error: error.message,
    });
  }
};

exports.findByPk = async (req, res) => {
  try {
    const member = await Members.findByPk(req.params.id);
    if (!member) {
      res.status(404).send({
        status: 404,
        message: message.error.get("members"),
      });
    } else {
      res.json({
        status: 200,
        data: member,
        message: message.success.get("members"),
      });
    }
  } catch (error) {
    res.status(500).send({
      status: 500,
      message: message.error.get("members"),
      error: error.message,
    });
  }
};

exports.create = async (req, res) => {
  try {
    const member = await Members.create(req.body);
    res.status(201).json({
      status: 201,
      data: member,
      message: message.success.create("members"),
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: 500,
      message: message.error.create("members"),
      error: error.message,
    });
  }
};

exports.update = async (req, res) => {
  try {
    let member = await Members.findByPk(req.params.id);
    if (!member) {
      res.status(404).send({
        status: 404,
        message: message.error.update("members"),
      });
    } else {
      member = await member.update(req.body);
      res.status(201).json({
        status: 201,
        data: member,
        message: message.success.update("members"),
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: 500,
      message: message.error.update("members"),
      error: error.message,
    });
  }
};

exports.destroy = async (req, res) => {
  try {
    const member = await Members.findByPk(req.params.id);
    if (!member) {
      res.status(404).send({
        status: 404,
        message: message.error.remove("members"),
      });
    } else {
      await member.destroy();
      res.json({
        status: 200,
        message: message.success.remove("members"),
      });
    }
  } catch (error) {
    res.status(500).send({
      status: 500,
      message: message.error.remove("members"),
      error: error.message,
    });
  }
};
