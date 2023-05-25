const { Conversations, Users, Groups } = require("../../config/db");

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "Messages",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      text: {
        type: DataTypes.TEXT("medium"),
        allowNull: false,
      },
      file: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      hidden: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: Users,
          key: "id",
        },
      },
      conversation_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: Conversations,
          key: "id",
        },
      },
      group_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: Groups,
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
      tableName: "messages",
      timestamps: false,
      underscored: true,
    }
  );
};
