module.exports = (sequelize, Sequelize) => {
  const Order = sequelize.define("orders", {
    order_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    customer_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "customers",
        key: "customer_id",
      },
    },
    operator_id: {
      type: Sequelize.INTEGER,
      allowNull: true, // Nullable initially until assigned
      references: {
        model: "operators",
        key: "operator_id",
      },
    },
    fuelType: {
      // Product type
      type: Sequelize.STRING,
      allowNull: false,
    },
    order_date: {
      // Date of order
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW, // Automatically set the current date/time
    },
    required_date: {
      // Date of required delivery
      type: Sequelize.DATE,
      allowNull: false,
    },
    current_time: {
      // Current time when the order is created
      type: Sequelize.TIME,
      allowNull: false,
      defaultValue: Sequelize.NOW, // Automatically set the current time
    },
    volume: {
      // Volume of the order
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    station: {
      // Station (delivery address)
      type: Sequelize.STRING,
      allowNull: false,
    },
    order_status: {
      // Status of the order
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "ordered", // Default status
    },
    paymentStatus: {
      // Payment status
      type: Sequelize.STRING,
      allowNull: false,
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
      defaultValue: Sequelize.NOW, // Automatically set the creation date
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW, // Automatically set the updated date
    },
  });

  return Order;
};
