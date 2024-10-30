const { format } = require("date-fns"); // Importing date-fns for formatting

// models/customer.model.js
module.exports = (sequelize, Sequelize) => {
    const Customer = sequelize.define("customers", {
      customer_id: {
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
  
    return Customer;
  };
  