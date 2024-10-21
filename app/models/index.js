const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  timezone: dbConfig.timezone, // Set the timezone here
  define: {
    timestamps: false, //true: createdAt & updatedAt
    freezeTableName: true, //To avoid plurals while creating table name
  },
  operatorsAliases: 0,
  logging: false,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// db.tutorials = require("./tutorial.model.js")(sequelize, Sequelize);


// db.staffs = require("./staff.model.js")(sequelize, Sequelize);
// db.students = require("./student.model.js")(sequelize, Sequelize);

db.admins = require("./admin.model.js")(sequelize, Sequelize);
db.managers = require("./manager.model.js")(sequelize, Sequelize);
db.operators = require("./operator.model.js")(sequelize, Sequelize);
db.customers = require("./customer.model.js")(sequelize, Sequelize);
db.orders = require("./order.model.js")(sequelize, Sequelize);
db.customerOperator = require("./customerOperator.model.js")(sequelize, Sequelize);
db.orderStatusHistory = require("./orderStatusHistory.model.js")(sequelize, Sequelize);


// Establish relationships


// Customer and Operator many-to-many relationship through CustomerOperator
db.customers.belongsToMany(db.operators, {
  through: db.customerOperator,
  foreignKey: "customer_id",
  otherKey: "operator_id",
});

db.operators.belongsToMany(db.customers, {
  through: db.customerOperator,
  foreignKey: "operator_id",
  otherKey: "customer_id",
});

// Define associations
db.customers.hasMany(db.customerOperator, { foreignKey: "customer_id" });
db.customerOperator.belongsTo(db.customers, { foreignKey: "customer_id" });

db.operators.hasMany(db.customerOperator, { foreignKey: "operator_id" });
db.customerOperator.belongsTo(db.operators, { foreignKey: "operator_id" });

db.customers.hasMany(db.orders, { foreignKey: "customer_id" });
db.orders.belongsTo(db.customers, { foreignKey: "customer_id" });

db.operators.hasMany(db.orders, { foreignKey: "operator_id" });
db.orders.belongsTo(db.operators, { foreignKey: "operator_id" });

db.orders.hasMany(db.orderStatusHistory, { foreignKey: "order_id" });
db.orderStatusHistory.belongsTo(db.orders, { foreignKey: "order_id" });

// Initialize associations
// Object.keys(db).forEach((modelName) => {
//   if (db[modelName].associate) {
//     db[modelName].associate(db);
//   }
// });

module.exports = db;

// db.d_expensetracker_db= require('./subcategory.model.js')
