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

// db.Messages = require("../routes/messages/model.js")(sequelize, Sequelize);

db.Conversations = require("../routes/conversations/model.js")(
  sequelize,
  Sequelize
);

db.BlockedUsers = require("../routes/blocked_users/model.js")(
  sequelize,
  Sequelize
);

// relations

//Convertion
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

//Blocked User
db.BlockedUsers.belongsTo(db.Users, { foreignKey: "blocker_id" });
db.BlockedUsers.belongsTo(db.Users, { foreignKey: "blocked_id" });
db.Users.hasMany(db.BlockedUsers, { foreignKey: "blocker_id" });
db.Users.hasMany(db.BlockedUsers, { foreignKey: "blocked_id" });

sequelize.sync({ force: false }).then(() => {
  console.log("yes re-sync done!");
});

module.exports = db;
