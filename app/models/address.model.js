// models/address.model.js
const { format } = require("date-fns");

module.exports = (sequelize, Sequelize) => {
  const Address = sequelize.define("addresses", {
    address_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    state: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    district: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    city: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    location: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    station: {
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
        return format(this.getDataValue("updatedAt"), "dd-MM-yyyy HH:mm:ss");
      },
    },
    deletedAt: {
      type: Sequelize.DATE,
      allowNull: true, // Optional field, initially null
      defaultValue: null,
      get() {
        const deletedAt = this.getDataValue("deletedAt");
        return deletedAt ? format(deletedAt, "dd-MM-yyyy HH:mm:ss") : null;
      },
    },
  });

  return Address;
};
