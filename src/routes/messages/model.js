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
        allowNull: true,
      },
      files: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
        get() {
          const files = this.getDataValue("files");
          return files ? files.split(",") : [];
        },
        set(value) {
          this.setDataValue("files", value.join(","));
        },
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
