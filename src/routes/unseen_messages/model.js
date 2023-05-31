const { Users, Messages } = require("../../config/db");

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "UnseenMessages",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: Users,
          key: "id",
        },
      },
      message_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: Messages,
          key: "id",
        },
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "unseen_messages",
      timestamps: false,
      underscored: true,
    }
  );
};
