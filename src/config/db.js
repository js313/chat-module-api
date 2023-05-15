const { Sequelize, Op } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_TYPE,
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((error) => {
    console.error("Unable to connect to the database: ", error);
  });

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.Op = Op;

db.Users = require("../routes/users/model.js")(sequelize, Sequelize);

db.Messages = require("../routes/messages/model.js")(sequelize, Sequelize);

db.Conversations = require("../routes/conversations/model.js")(
  sequelize,
  Sequelize
);

db.BlockedUsers = require("../routes/blocked_users/model.js")(
  sequelize,
  Sequelize
);

db.Groups = require("../routes/groups/model.js")(sequelize, Sequelize);

db.Members = require("../routes/groups_members/model.js")(sequelize, Sequelize);

// relations

//Conversations
db.Conversations.belongsTo(db.Users, { foreignKey: "sender_id", as: "sender" });
db.Conversations.belongsTo(db.Users, {
  foreignKey: "receiver_id",
  as: "receiver",
});
db.Users.hasMany(db.Conversations, {
  foreignKey: "sender_id",
  as: "user1_conversations",
});
db.Users.hasMany(db.Conversations, {
  foreignKey: "receiver_id",
  as: "user2_conversations",
});

//Messages
db.Messages.belongsTo(db.Users, {
  foreignKey: "sender_id",
  as: "sender",
});
db.Messages.belongsTo(db.Conversations, {
  foreignKey: "conversation_id",
  as: "conversation",
});
db.Messages.belongsTo(db.Groups, { foreignKey: "group_id" });
db.Users.hasMany(db.Messages, { foreignKey: "sender_id", as: "messages" });
db.Conversations.hasMany(db.Messages, {
  foreignKey: "conversation_id",
  as: "messages",
});
db.Groups.hasMany(db.Messages, { foreignKey: "group_id" });

//Groups
db.Groups.belongsTo(db.Users, { foreignKey: "created_by", as: "creator" });
db.Users.hasMany(db.Groups, {
  foreignKey: "created_by",
  as: "groups",
});

//Blocked Users
db.Users.hasMany(db.BlockedUsers, {
  foreignKey: "blocker_id",
  as: "blockers",
});
db.Users.hasMany(db.BlockedUsers, {
  foreignKey: "blocked_id",
  as: "blockedBy",
});
db.BlockedUsers.belongsTo(db.Users, {
  foreignKey: "blocker_id",
  as: "blocker",
});
db.BlockedUsers.belongsTo(db.Users, {
  foreignKey: "blocked_id",
  as: "blocked",
});

//Members
db.Members.belongsTo(db.Groups, { foreignKey: "group_id", as: "group" });
db.Members.belongsTo(db.Users, { foreignKey: "user_id", as: "member" });
db.Users.belongsToMany(db.Groups, {
  through: db.Members,
  foreignKey: "user_id",
  otherKey: "group_id",
});

db.Groups.belongsToMany(db.Users, {
  through: db.Members,
  foreignKey: "group_id",
  otherKey: "user_id",
});

sequelize.sync({ force: false }).then(() => {
  console.log("yes re-sync done!");
});

module.exports = db;
