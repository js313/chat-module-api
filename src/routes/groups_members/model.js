const { Groups, Users } = require("../../config/db");

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "Members",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      group_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: Groups,
          key: "id",
        },
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: Users,
          key: "id",
        },
      },
      joined_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      left_at: {
        type: DataTypes.DATE,
        defaultValue: null,
      },
    },
    {
      tableName: "members",
      timestamps: false,
    }
  );
};
