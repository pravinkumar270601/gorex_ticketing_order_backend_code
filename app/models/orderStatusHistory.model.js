const { format } = require("date-fns"); // Importing date-fns for formatting

// models/orderStatusHistory.js
module.exports = (sequelize, Sequelize) => {
    const OrderStatusHistory = sequelize.define("order_status_history", {
      orderStatusHistory_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "orders",
          key: "order_id",
        },
      },
      order_status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW,
        get() {
          const timestampValue = this.getDataValue("timestamp");
          return timestampValue ? format(new Date(timestampValue), "dd-MM-yyyy HH:mm:ss") : null;
        },
      },
      active_status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false, // Set default to true
      },
      dateOfRequired: {
        type: Sequelize.DATEONLY,
        allowNull: true, // Allow null if not required
        get() {
          const dateValue = this.getDataValue("dateOfRequired");
          return dateValue ? format(new Date(dateValue), "dd-MM-yyyy") : null; // Format as DD-MM-YYYY
        },
      },
      tracing_status: {  // New field added here
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false, // Set default to false
      },
    });
  
    return OrderStatusHistory;
  };
  