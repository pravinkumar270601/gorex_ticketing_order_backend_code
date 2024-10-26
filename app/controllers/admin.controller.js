const db = require("../models");
const Admin = db.admins;
const { Op } = require("sequelize"); // Import Op from sequelize
const Order = db.orders; // Reference to the Order model
// const CustomerOperator = db.customerOperator;
const OrderStatusHistory = db.orderStatusHistory;
const Customer = db.customers;
const Operator = db.operators;

const RESPONSE = require("../constants/response");
const { MESSAGE } = require("../constants/message");
const { StatusCode } = require("../constants/HttpStatusCode");


// Registration
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if email or phone number already exists
    const existingAdmin = await Admin.findOne({
      where: {
        [Op.or]: [{ email }, { phone }],
      },
    });

    if (existingAdmin) {
      RESPONSE.Success.Message = "Email or phone number already exists.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);

      // return res
      //   .status(400)
      //   .json({ message: "Email or phone number already exists." });
    }

    const admin = await Admin.create({ name, email, phone, password });
    RESPONSE.Success.Message = "Admin registered successfully";
    RESPONSE.Success.data = admin;
    res.status(StatusCode.CREATED.code).send(RESPONSE.Success);

    // res.status(201).json({ message: "Admin registered successfully", admin });
  } catch (error) {
    console.error("registerAdmin:", error);
    RESPONSE.Failure.Message = error.message || "Error registering admin";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res
    //   .status(500)
    //   .json({ message: "Error registering admin", error: error.message });
  }
};

// Login
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ where: { email, password } });
    if (!admin) {
      RESPONSE.Success.Message = "Admin not found!";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      // return res.status(401).json({ message: "Invalid credentials" });
    }
    RESPONSE.Success.Message = "Admin logged in successfully";
    RESPONSE.Success.data = admin;
    res.status(StatusCode.CREATED.code).send(RESPONSE.Success);
    // res.status(200).json({ message: "Admin logged in successfully", admin });
  } catch (error) {
    console.error("loginAdmin:", error);
    RESPONSE.Failure.Message = error.message || "Error logging in admin.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    //   res
    //     .status(500)
    //     .json({ message: "Error logging in admin", error: error.message });
  }
};



// Get admin details by admin_id
exports.getAdminById = async (req, res) => {
  const adminId = req.params.admin_id; // Get admin_id from request parameters

  try {
    const admin = await Admin.findOne({
      where: { admin_id: adminId },
      attributes: { exclude: ["password"] }, // Exclude the password field from the response
    });

    if (!admin) {
      RESPONSE.Failure.Message = "Admin not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
      // return res.status(404).json({ message: "Admin not found." });
    }

    RESPONSE.Success.Message = "getAdmin successfully.";
    RESPONSE.Success.data = admin;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // res.status(200).json(admin);
  } catch (error) {
    console.error("Error fetching admin by ID:", error);
    RESPONSE.Failure.Message =
      error.message || "Error fetching admin.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // console.error("Error fetching admin by ID:", error);
    // res.status(500).json({ message: "Error fetching admin." });
  }
};


exports.getOverallDashboardStats = async (req, res) => {
  try {
    // Fetch total order count, total volume, and total amountOfProduct from the Orders table
    const orderStats = await Order.findAll({
      where: { delete_status: 0 },
      attributes: [
        [db.Sequelize.fn("COUNT", db.Sequelize.col("order_id")), "totalOrderCount"],
        [db.Sequelize.fn("SUM", db.Sequelize.col("volume")), "totalVolume"],
        [db.Sequelize.fn("SUM", db.Sequelize.col("amountOfProduct")), "totalAmountOfProduct"]
      ],
      raw: true
    });

    // Count each status from the OrderStatusHistory table where active_status is true
    const statusCounts = await OrderStatusHistory.findAll({
      where: { active_status: true },
      attributes: [
        "order_status",
        [db.Sequelize.fn("COUNT", db.Sequelize.col("OrderStatusHistory_id")), "count"]
      ],
      group: ["order_status"],
      raw: true
    });

    // Get total operator count from the Operators table
    const operatorStats = await Operator.findAll({
      attributes: [
        [db.Sequelize.fn("COUNT", db.Sequelize.col("operator_id")), "totalOperatorCount"]
      ],
      raw: true
    });

    // Get total customer count from the Customers table
    const customerStats = await Customer.findAll({
      attributes: [
        [db.Sequelize.fn("COUNT", db.Sequelize.col("customer_id")), "totalCustomerCount"]
      ],
      raw: true
    });

    // Structure the result to make it easier to read
    const result = {
      totalOrderCount: orderStats[0].totalOrderCount || 0,
      totalVolume: orderStats[0].totalVolume || 0,
      totalAmountOfProduct: orderStats[0].totalAmountOfProduct || 0,
      statusCounts: {
        ordered: 0,
        shipped: 0,
        delivered: 0
      },
      totalOperatorCount: operatorStats[0].totalOperatorCount || 0,
      totalCustomerCount: customerStats[0].totalCustomerCount || 0
    };

    // Update status counts based on the query result
    statusCounts.forEach((status) => {
      if (status.order_status === "ordered") {
        result.statusCounts.ordered = status.count;
      } else if (status.order_status === "shipped") {
        result.statusCounts.shipped = status.count;
      } else if (status.order_status === "delivered") {
        result.statusCounts.delivered = status.count;
      }
    });

    RESPONSE.Success.Message = "Overall dashboard statistics retrieved successfully.";
    RESPONSE.Success.data = result;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("getOverallDashboardStats:", error);
    RESPONSE.Failure.Message = error.message || "An error occurred while fetching dashboard statistics.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};


