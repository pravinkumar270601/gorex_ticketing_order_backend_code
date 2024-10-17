// models/customerOperator.model.js

module.exports = (sequelize, Sequelize) => {
    const CustomerOperator = sequelize.define("customer_operator", {
      assignment_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "customers", // Name of the Customer model
          key: "customer_id"
        }
      },
      operator_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "operators", // Name of the Operator model
          key: "operator_id"
        }
      },
      delete_status: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 0 // Default is active (0)
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  
    return CustomerOperator;
  };
  