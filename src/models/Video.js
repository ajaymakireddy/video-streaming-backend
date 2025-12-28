const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Video = sequelize.define("Video", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "processing", // processing | safe | flagged
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tenantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Video;
