const { format } = require("date-fns"); // Importing date-fns for formatting

// models/operator.model.js
module.exports = (sequelize, Sequelize) => {
    const Operator = sequelize.define("operators", {
      operator_id: {
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
      approval_status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "pending", // Default to "pending"
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
    });
  
    return Operator;
  };
  