const db = require("../../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Users } = db;
const message = require("../../utils/responseMessage");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1000h",
    });
    res.status(200).json({
      user: {
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await Users.findOne({ where: { email } });

    if (user) {
      return res.status(409).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    user = await Users.create({ name, email, password: hashedPassword });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1000h",
    });
    res.status(200).json({
      user: {
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.findAll = async (req, res) => {
  try {
    let user = await Users.findAll();
    res.json({
      status: 200,
      data: user,
      message: message.success.get("users"),
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: 500,
      message: message.error.get("users"),
      error: error.message,
    });
  }
};

exports.findByPk = async (req, res) => {
  try {
    console.log("edfn|", req.params.id);
    const user = await Users.findByPk(req.params.id);
    if (!user) {
      res.status(404).send({
        status: 404,
        message: message.error.get("users"),
      });
    } else {
      res.json({
        status: 200,
        data: user,
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
  let user = req.body;
  user.password = await bcrypt.hash(user.password, 10);

  try {
    const user = await Users.create(user);
    res.status(201).json({
      status: 201,
      data: user,
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
    let user = await Users.findByPk(req.params.id);
    if (!user) {
      res.status(404).send({
        status: 404,
        message: message.error.update("users"),
      });
    } else {
      user = await user.update(req.body);
      res.status(201).json({
        status: 201,
        data: user,
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
    const user = await Users.findByPk(req.params.id);
    if (!user) {
      res.status(404).send({
        status: 404,
        message: message.error.remove("users"),
      });
    } else {
      await user.destroy();
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
