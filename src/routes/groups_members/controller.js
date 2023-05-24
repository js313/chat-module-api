const db = require("../../config/db");
const { Members, Groups, Users } = db;
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

// exports.joinGroup = async (req, res) => {
//   try {
//     const { link } = req.body;

//     const group = await Groups.findOne({
//       where: {
//         link: {
//           [Op.eq]: link,
//         },
//       },
//     });
//     console.log("group", group);
//     if (!group) {
//       return res.status(404).json({
//         status: 404,
//         message: "Group not found",
//       });
//     }

//     const existingMember = await Members.findOne({
//       where: {
//         group_id: group.id,
//         user_id: req.user.id,
//       },
//     });

//     if (existingMember) {
//       return res.status(400).json({
//         status: 400,
//         message: "You are already a member of this group",
//       });
//     }

//     const member = await Members.create({
//       group_id: group.id,
//       user_id: req.user.id,
//       joined_at: new Date(),
//     });

//     res.status(200).json({
//       status: 200,
//       data: member,
//       message: "Successfully joined the group",
//     });
//   } catch (error) {
//     res.status(500).send({
//       status: 500,
//       message: "Failed to join the group",
//       error: error.message,
//     });
//   }
// };
