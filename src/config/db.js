const {Sequelize,Op} = require("sequelize");

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

db.Users = require("../routes/users/model.js")(sequelize, Sequelize);

db.Users = require("../routes/users/model.js")(sequelize, Sequelize);

db.Users = require("../routes/users/model.js")(sequelize, Sequelize);

db.Users = require("../routes/users/model.js")(sequelize, Sequelize);



// relations




sequelize.sync({ force: false }).then(() => {
  console.log("yes re-sync done!");
});

module.exports = db;
