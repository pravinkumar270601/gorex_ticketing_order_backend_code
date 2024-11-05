const { format } = require("date-fns"); // Importing date-fns for formatting

// models/manager.model.js
module.exports = (sequelize, Sequelize) => {
  const Manager = sequelize.define("managers", {
    manager_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      // unique: true,
    },
    phone: {
      type: Sequelize.STRING,
      allowNull: false,
      // unique: true,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    profileImage: {
      type: Sequelize.STRING,
      allowNull: true, // Optional field
    },
    delete_status: {
      // Soft delete field (0 = active, 1 = deleted)
      type: Sequelize.TINYINT,
      allowNull: false,
      defaultValue: 0, // Default is active (0)
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      get() {
        return format(this.getDataValue("createdAt"), "dd-MM-yyyy HH:mm:ss");
      },
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      get() {
        return format(this.getDataValue("createdAt"), "dd-MM-yyyy HH:mm:ss");
      },
    },
    deletedAt: {
      type: Sequelize.DATE,
      allowNull: true, // Optional field, initially null
      defaultValue: null,
      get() {
        return format(this.getDataValue("deletedAt"), "dd-MM-yyyy HH:mm:ss");
      },
    },
  });

  return Manager;
};
