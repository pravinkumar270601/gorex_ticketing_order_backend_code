const db = require("../models");
const Order = db.orders; // Reference to the Order model
const CustomerOperator = db.customerOperator;
const OrderStatusHistory = db.orderStatusHistory;
const Customer = db.customers;
const Operator = db.operators;
const { Op } = require("sequelize"); // Import Sequelize operators

const RESPONSE = require("../constants/response");
const { MESSAGE } = require("../constants/message");
const { StatusCode } = require("../constants/HttpStatusCode");

// admin ---------------------------------------------------------------

exports.getOverallDashboardStatsWithFilter = async (req, res) => {
  const { from_date, to_date } = req.body;

  // Initialize date variables
  let startDate;
  let endDate;

  // If both from_date and to_date are provided
  if (from_date && to_date) {
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date(to_date + "T23:59:59");
  } else if (from_date) {
    // If only from_date is provided
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date(); // Get all until now
  } else if (to_date) {
    // If only to_date is provided
    startDate = new Date("1970-01-01T00:00:00"); // Get all from the beginning of time
    endDate = new Date(to_date + "T23:59:59");
  }

  try {
    // Fetch total order count, total volume, and total amountOfProduct from the Orders table
    const orderStats = await Order.findAll({
      where: {
        delete_status: 0,
        ...(startDate && endDate
          ? { createdAt: { [Op.between]: [startDate, endDate] } }
          : {}),
      },
      attributes: [
        [
          db.Sequelize.fn("COUNT", db.Sequelize.col("order_id")),
          "totalOrderCount",
        ],
        [db.Sequelize.fn("SUM", db.Sequelize.col("volume")), "totalVolume"],
        [
          db.Sequelize.fn("SUM", db.Sequelize.col("amountOfProduct")),
          "totalAmountOfProduct",
        ],
      ],
      raw: true,
    });

    // Count each status from the OrderStatusHistory table where active_status is true and related to the filtered orders
    const statusCounts = await OrderStatusHistory.findAll({
      where: {
        active_status: true,
        delete_status: 0,
      },
      include: [
        {
          model: Order,
          where: {
            delete_status: 0,
            ...(startDate && endDate
              ? { createdAt: { [Op.between]: [startDate, endDate] } }
              : {}),
          },
          attributes: [], // We don't need any attributes from the Order table, just the filtering
        },
      ],
      attributes: [
        "order_status",
        [
          db.Sequelize.fn("COUNT", db.Sequelize.col("OrderStatusHistory_id")),
          "count",
        ],
      ],
      group: ["order_status"],
      raw: true,
    });

    // Get total operator count from the Operators table
    const operatorStats = await Operator.findAll({
      where: {
        ...(startDate && endDate
          ? {
              [Op.and]: [
                { createdAt: { [Op.lte]: endDate } },
                {
                  [Op.or]: [
                    { deletedAt: null },
                    { deletedAt: { [Op.gte]: startDate } },
                  ],
                },
              ],
            }
          : {}),
      },
      attributes: [
        [
          db.Sequelize.fn("COUNT", db.Sequelize.col("operator_id")),
          "totalOperatorCount",
        ],
      ],
      raw: true,
    });

    // Get total customer count from the Customers table
    const customerStats = await Customer.findAll({
      where: {
        ...(startDate && endDate
          ? {
              [Op.and]: [
                { createdAt: { [Op.lte]: endDate } },
                {
                  [Op.or]: [
                    { deletedAt: null },
                    { deletedAt: { [Op.gte]: startDate } },
                  ],
                },
              ],
            }
          : {}),
      },
      attributes: [
        [
          db.Sequelize.fn("COUNT", db.Sequelize.col("customer_id")),
          "totalCustomerCount",
        ],
      ],
      raw: true,
    });

    // Structure the result to make it easier to read
    const result = {
      totalOrderCount: orderStats[0].totalOrderCount || 0,
      totalVolume: orderStats[0].totalVolume || 0,
      totalAmountOfProduct: orderStats[0].totalAmountOfProduct || 0,
      statusCounts: {
        ordered: 0,
        shipped: 0,
        delivered: 0,
      },
      totalOperatorCount: operatorStats[0].totalOperatorCount || 0,
      totalCustomerCount: customerStats[0].totalCustomerCount || 0,
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

    RESPONSE.Success.Message =
      "Overall dashboard statistics retrieved successfully.";
    RESPONSE.Success.data = result;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("getOverallDashboardStats:", error);
    RESPONSE.Failure.Message =
      error.message || "An error occurred while fetching dashboard statistics.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// Get all active orders with customer and operator details, filtered by createdAt date range
exports.getAllOrdersWithCustomerAndOperatorDetailsWithFilter = async (
  req,
  res
) => {
  const { from_date, to_date } = req.body; // Get the date range from the request body

  // Initialize date variables
  let startDate;
  let endDate;

  // If both from_date and to_date are provided
  if (from_date && to_date) {
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date(to_date + "T23:59:59");
  } else if (from_date) {
    // If only from_date is provided
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date(); // Get all until now
  } else if (to_date) {
    // If only to_date is provided
    startDate = new Date("1970-01-01T00:00:00"); // Get all from the beginning of time
    endDate = new Date(to_date + "T23:59:59");
  }

  try {
    const orders = await Order.findAll({
      // where: {
      //   delete_status: 0, // Fetch active orders
      //   createdAt: {
      //     [Op.between]: [startDate, endDate], // Filter based on the date range
      //   },
      // },
      where: {
        delete_status: 0,
        ...(startDate && endDate
          ? { createdAt: { [Op.between]: [startDate, endDate] } }
          : {}),
      },
      include: [
        {
          model: Customer,
          attributes: { exclude: ["password"] }, // Exclude the password field from Customer
        },
        {
          model: Operator,
          attributes: { exclude: ["password"] }, // Exclude the password field from Operator
        },
      ],
    });

    RESPONSE.Success.Message =
      "Active orders with customer and operator details retrieved successfully.";
    RESPONSE.Success.data = orders;
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error(
      "Error retrieving orders with customer and operator details:",
      error
    );
    RESPONSE.Failure.Message =
      error.message || "Error retrieving active orders.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

exports.getAllOperatorsWithCustomerDetailWithFilter = async (req, res) => {
  const { from_date, to_date } = req.body; // Get the date range from the request body

  // Initialize date variables
  let startDate;
  let endDate;

  // If both from_date and to_date are provided
  if (from_date && to_date) {
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date(to_date + "T23:59:59");
  } else if (from_date) {
    // If only from_date is provided
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date(); // Get all until now
  } else if (to_date) {
    // If only to_date is provided
    startDate = new Date("1970-01-01T00:00:00"); // Get all from the beginning of time
    endDate = new Date(to_date + "T23:59:59");
  }
  try {
    const operators = await Operator.findAll({
      where: {
        ...(startDate && endDate
          ? {
              [Op.and]: [
                { createdAt: { [Op.lte]: endDate } },
                {
                  [Op.or]: [
                    { deletedAt: null },
                    { deletedAt: { [Op.gte]: startDate } },
                  ],
                },
              ],
            }
          : {}),
      },
      include: [
        {
          model: Customer,
          through: {
            model: CustomerOperator,
            where: { delete_status: 0 },
            attributes: [], // Do not include any extra fields from the junction table
          },
          attributes: { exclude: ["password"] }, // Exclude the password field from customers
          // attributes: ["name", "email"], // Only include name and email
        },
      ],
    });

    RESPONSE.Success.Message =
      "All operators with their customers' details retrieved successfully.";
    RESPONSE.Success.data = operators;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("Error fetching operators with customers:", error);
    RESPONSE.Failure.Message =
      error.message || "Error fetching operators with customers.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

exports.getAllCustomersWithOperatorsDetailsWithFilter = async (req, res) => {
  const { from_date, to_date } = req.body; // Get the date range from the request body

  // Initialize date variables
  let startDate;
  let endDate;

  // If both from_date and to_date are provided
  if (from_date && to_date) {
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date(to_date + "T23:59:59");
  } else if (from_date) {
    // If only from_date is provided
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date(); // Get all until now
  } else if (to_date) {
    // If only to_date is provided
    startDate = new Date("1970-01-01T00:00:00"); // Get all from the beginning of time
    endDate = new Date(to_date + "T23:59:59");
  }

  try {
    const customers = await Customer.findAll({
      // where: { delete_status: 0 }, i don't set delete_status for customer  // Fetch active customers
      where: {
        ...(startDate && endDate
          ? {
              [Op.and]: [
                { createdAt: { [Op.lte]: endDate } },
                {
                  [Op.or]: [
                    { deletedAt: null },
                    { deletedAt: { [Op.gte]: startDate } },
                  ],
                },
              ],
            }
          : {}),
      },
      include: [
        {
          model: Operator,
          
          through: {
            model: CustomerOperator,
            where: { delete_status:0 },
            attributes: [], // Don't include extra fields from the junction table
          },
        },
      ],
      attributes: { exclude: ["password"] }, // Exclude the password field from the response
      // attributes: ["name", "email"], // Only include name and email
    });

    RESPONSE.Success.Message =
      "getAllCustomersWithOperatorsDetails successfully.";
    RESPONSE.Success.data = customers;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // res.status(200).json(customers);
  } catch (error) {
    console.error("Error fetching customers with operators:", error);
    RESPONSE.Failure.Message =
      error.message || "Error fetching customers with operators.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res.status(500).json({ message: "Error fetching customers with operators." });
  }
};

exports.getAllOrdersWithFilter = async (req, res) => {
  const { from_date, to_date } = req.body; // Get the date range from the request body

  // Initialize date variables
  let startDate;
  let endDate;

  // If both from_date and to_date are provided
  if (from_date && to_date) {
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date(to_date + "T23:59:59");
  } else if (from_date) {
    // If only from_date is provided
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date(); // Get all until now
  } else if (to_date) {
    // If only to_date is provided
    startDate = new Date("1970-01-01T00:00:00"); // Get all from the beginning of time
    endDate = new Date(to_date + "T23:59:59");
  }

  try {
    const orders = await Order.findAll({
      where: {
        delete_status: 0,
        ...(startDate && endDate
          ? { createdAt: { [Op.between]: [startDate, endDate] } }
          : {}),
      },
      include: [
        {
          model: Customer,
          attributes: { exclude: ["password"] }, // Exclude sensitive fields like password
          // attributes: ["name", "email"], // Only include name and email
        },
        {
          model: Operator,
          attributes: { exclude: ["password"] },
          // attributes: ["name", "email"], // Only include name and email
        },
      ],
    });

    RESPONSE.Success.Message = "Orders retrieved successfully.";
    RESPONSE.Success.data = orders;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("getAllOrders:", error);
    RESPONSE.Failure.Message =
      error.message || "An error occurred while fetching orders.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

exports.getAllOperatorsWithFilter = async (req, res) => {
  const { from_date, to_date } = req.body; // Get the date range from the request body

  // Initialize date variables
  let startDate;
  let endDate;

  // If both from_date and to_date are provided
  if (from_date && to_date) {
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date(to_date + "T23:59:59");
  } else if (from_date) {
    // If only from_date is provided
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date(); // Get all until now
  } else if (to_date) {
    // If only to_date is provided
    startDate = new Date("1970-01-01T00:00:00"); // Get all from the beginning of time
    endDate = new Date(to_date + "T23:59:59");
  }
  try {
    const operators = await Operator.findAll({
      where: {
        ...(startDate && endDate
          ? {
              [Op.and]: [
                { createdAt: { [Op.lte]: endDate } },
                {
                  [Op.or]: [
                    { deletedAt: null },
                    { deletedAt: { [Op.gte]: startDate } },
                  ],
                },
              ],
            }
          : {}),
      },
    });

    RESPONSE.Success.Message = "Operators retrieved successfully.";
    RESPONSE.Success.data = operators;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("getAllOperators:", error);
    RESPONSE.Failure.Message =
      error.message || "An error occurred while fetching operators.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

exports.getAllCustomersWithFilter = async (req, res) => {
  const { from_date, to_date } = req.body; // Get the date range from the request body

  // Initialize date variables
  let startDate;
  let endDate;

  // If both from_date and to_date are provided
  if (from_date && to_date) {
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date(to_date + "T23:59:59");
  } else if (from_date) {
    // If only from_date is provided
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date(); // Get all until now
  } else if (to_date) {
    // If only to_date is provided
    startDate = new Date("1970-01-01T00:00:00"); // Get all from the beginning of time
    endDate = new Date(to_date + "T23:59:59");
  }

  try {
    const customers = await Customer.findAll({
      where: {
        ...(startDate && endDate
          ? {
              [Op.and]: [
                { createdAt: { [Op.lte]: endDate } },
                {
                  [Op.or]: [
                    { deletedAt: null },
                    { deletedAt: { [Op.gte]: startDate } },
                  ],
                },
              ],
            }
          : {}),
      },
    });

    RESPONSE.Success.Message = "Customers retrieved successfully.";
    RESPONSE.Success.data = customers;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("getAllCustomers:", error);
    RESPONSE.Failure.Message =
      error.message || "An error occurred while fetching customers.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

exports.getAllOrderedStatusOrdersByOrdersTimeWithFilter = async (req, res) => {
  const { from_date, to_date } = req.body; // Get the date range from the request body

  // Initialize date variables
  let startDate;
  let endDate;

  // If both from_date and to_date are provided
  if (from_date && to_date) {
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date(to_date + "T23:59:59");
  } else if (from_date) {
    // If only from_date is provided
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date(); // Get all until now
  } else if (to_date) {
    // If only to_date is provided
    startDate = new Date("1970-01-01T00:00:00"); // Get all from the beginning of time
    endDate = new Date(to_date + "T23:59:59");
  }

  try {
    const orders = await OrderStatusHistory.findAll({
      where: {
        active_status: true,
        order_status: "ordered", // Use the status provided in the request
        delete_status: 0
      },
      include: [
        {
          model: Order,
          where: {
            delete_status: 0,
            ...(startDate && endDate
              ? { createdAt: { [Op.between]: [startDate, endDate] } }
              : {}),
          },
          include: [
            {
              model: Customer,
              attributes: ["customer_id", "name", "email"], // Specify attributes as needed
            },
            {
              model: Operator,
              attributes: ["operator_id", "name", "email"], // Specify attributes as needed
            },
          ],
        },
        
      ],

    });

    RESPONSE.Success.Message = `Orders with status ordered retrieved successfully.`;
    RESPONSE.Success.data = orders;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("getOrdersByStatus:", error);
    RESPONSE.Failure.Message =
      error.message || "An error occurred while fetching orders by status.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

exports.getAllShippedStatusOrdersByOrdersTimeWithFilter = async (req, res) => {
  const { from_date, to_date } = req.body; // Get the date range from the request body

  // Initialize date variables
  let startDate;
  let endDate;

  // If both from_date and to_date are provided
  if (from_date && to_date) {
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date(to_date + "T23:59:59");
  } else if (from_date) {
    // If only from_date is provided
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date(); // Get all until now
  } else if (to_date) {
    // If only to_date is provided
    startDate = new Date("1970-01-01T00:00:00"); // Get all from the beginning of time
    endDate = new Date(to_date + "T23:59:59");
  }

  try {
    const orders = await OrderStatusHistory.findAll({
      where: {
        active_status: true,
        order_status: "shipped", // Use the status provided in the request
        delete_status: 0
      },
      include: [
        {
          model: Order,
          where: {
            delete_status: 0,
            ...(startDate && endDate
              ? { createdAt: { [Op.between]: [startDate, endDate] } }
              : {}),
          },
          include: [
            {
              model: Customer,
              attributes: ["customer_id", "name", "email"], // Specify attributes as needed
            },
            {
              model: Operator,
              attributes: ["operator_id", "name", "email"], // Specify attributes as needed
            },
          ],
        },
      ],
    });

    RESPONSE.Success.Message = `Orders with status shipped retrieved successfully.`;
    RESPONSE.Success.data = orders;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("getshippedByStatus:", error);
    RESPONSE.Failure.Message =
      error.message || "An error occurred while fetching shipped by status.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

exports.getAllDeliveredStatusOrdersByOrdersTimeWithFilter = async (
  req,
  res
) => {
  const { from_date, to_date } = req.body; // Get the date range from the request body

  // Initialize date variables
  let startDate;
  let endDate;

  // If both from_date and to_date are provided
  if (from_date && to_date) {
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date(to_date + "T23:59:59");
  } else if (from_date) {
    // If only from_date is provided
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date(); // Get all until now
  } else if (to_date) {
    // If only to_date is provided
    startDate = new Date("1970-01-01T00:00:00"); // Get all from the beginning of time
    endDate = new Date(to_date + "T23:59:59");
  }

  try {
    const orders = await OrderStatusHistory.findAll({
      where: {
        active_status: true,
        order_status: "delivered", // Use the status provided in the request
        delete_status: 0
      },
      include: [
        {
          model: Order,
          where: {
            delete_status: 0,
            ...(startDate && endDate
              ? { createdAt: { [Op.between]: [startDate, endDate] } }
              : {}),
          },
          include: [
            {
              model: Customer,
              attributes: ["customer_id", "name", "email"], // Specify attributes as needed
            },
            {
              model: Operator,
              attributes: ["operator_id", "name", "email"], // Specify attributes as needed
            },
          ],
        },
      ],
    });

    RESPONSE.Success.Message = `Orders with status delivered retrieved successfully.`;
    RESPONSE.Success.data = orders;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("getdeliveredByStatus:", error);
    RESPONSE.Failure.Message =
      error.message || "An error occurred while fetching delivered by status.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// <><><><><><>filer based on orders status updated or filter date ><><><><><>
exports.getAllOrderedStatusOrdersWithFilter = async (req, res) => {
  const { from_date, to_date } = req.body; // Get the date range from the request body

  // Initialize date variables
  let startDate;
  let endDate;

  // If both from_date and to_date are provided
  if (from_date && to_date) {
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date(to_date + "T23:59:59");
  } else if (from_date) {
    // If only from_date is provided
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date(); // Get all until now
  } else if (to_date) {
    // If only to_date is provided
    startDate = new Date("1970-01-01T00:00:00"); // Get all from the beginning of time
    endDate = new Date(to_date + "T23:59:59");
  }

  try {
    const orders = await OrderStatusHistory.findAll({
      where: {
        active_status: true,
        order_status: "ordered", // Use the status provided in the request
        ...(startDate && endDate
          ? { timestamp: { [Op.between]: [startDate, endDate] } }
          : {}),
      },
      include: [
        {
          model: Order,
          where: {
            delete_status: 0,
          },
        },
      ],
    });

    RESPONSE.Success.Message = `Orders with status ordered retrieved successfully.`;
    RESPONSE.Success.data = orders;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("getOrdersByStatus:", error);
    RESPONSE.Failure.Message =
      error.message || "An error occurred while fetching orders by status.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

exports.getAllShippedStatusOrdersWithFilter = async (req, res) => {
  const { from_date, to_date } = req.body; // Get the date range from the request body

  // Initialize date variables
  let startDate;
  let endDate;

  // If both from_date and to_date are provided
  if (from_date && to_date) {
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date(to_date + "T23:59:59");
  } else if (from_date) {
    // If only from_date is provided
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date(); // Get all until now
  } else if (to_date) {
    // If only to_date is provided
    startDate = new Date("1970-01-01T00:00:00"); // Get all from the beginning of time
    endDate = new Date(to_date + "T23:59:59");
  }

  try {
    const orders = await OrderStatusHistory.findAll({
      where: {
        active_status: true,
        order_status: "shipped", // Use the status provided in the request
        ...(startDate && endDate
          ? { timestamp: { [Op.between]: [startDate, endDate] } }
          : {}),
      },
      include: [
        {
          model: Order,
          where: {
            delete_status: 0,
          },
        },
      ],
    });

    RESPONSE.Success.Message = `Orders with status shipped retrieved successfully.`;
    RESPONSE.Success.data = orders;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("getOrdersByStatus:", error);
    RESPONSE.Failure.Message =
      error.message || "An error occurred while fetching orders by status.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

exports.getAllDeliveredStatusOrdersWithFilter = async (req, res) => {
  const { from_date, to_date } = req.body; // Get the date range from the request body

  // Initialize date variables
  let startDate;
  let endDate;

  // If both from_date and to_date are provided
  if (from_date && to_date) {
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date(to_date + "T23:59:59");
  } else if (from_date) {
    // If only from_date is provided
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date(); // Get all until now
  } else if (to_date) {
    // If only to_date is provided
    startDate = new Date("1970-01-01T00:00:00"); // Get all from the beginning of time
    endDate = new Date(to_date + "T23:59:59");
  }

  try {
    const orders = await OrderStatusHistory.findAll({
      where: {
        active_status: true,
        order_status: "delivered", // Use the status provided in the request
        ...(startDate && endDate
          ? { timestamp: { [Op.between]: [startDate, endDate] } }
          : {}),
      },
      include: [
        {
          model: Order,
          where: {
            delete_status: 0,
          },
        },
      ],
    });

    RESPONSE.Success.Message = `Orders with status delivered retrieved successfully.`;
    RESPONSE.Success.data = orders;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("getOrdersByStatus:", error);
    RESPONSE.Failure.Message =
      error.message || "An error occurred while fetching orders by status.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};
// <><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><>

// Customer -------------------------------------------------------------
exports.getDashboardStatsForCustomerWithFilter = async (req, res) => {
  const { customer_id } = req.params;
  const { from_date, to_date } = req.body;

  // Initialize date variables
  let startDate;
  let endDate;

  // If both from_date and to_date are provided
  if (from_date && to_date) {
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date(to_date + "T23:59:59");
  } else if (from_date) {
    // If only from_date is provided
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date(); // Get all until now
  } else if (to_date) {
    // If only to_date is provided
    startDate = new Date("1970-01-01T00:00:00"); // Get all from the beginning of time
    endDate = new Date(to_date + "T23:59:59");
  }

  try {
    // Check if the customer exists
    const customerExists = await Customer.findOne({
      where: { customer_id },
    });

    if (!customerExists) {
      RESPONSE.Failure.Message = "Customer not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    // Total volume count and total order count from the Orders table
    const orderStats = await Order.findAll({
      where: {
        customer_id,
        delete_status: 0,
        ...(startDate && endDate
          ? { createdAt: { [Op.between]: [startDate, endDate] } }
          : {}),
      },
      attributes: [
        [db.Sequelize.fn("SUM", db.Sequelize.col("volume")), "totalVolume"],
        [
          db.Sequelize.fn("COUNT", db.Sequelize.col("order_id")),
          "totalOrderCount",
        ],
        [
          db.Sequelize.fn("SUM", db.Sequelize.col("amountOfProduct")),
          "totalAmountOfProduct",
        ],
      ],
      raw: true,
    });

    // Count of each status in the OrderStatusHistory table where active_status is true
    const statusCounts = await OrderStatusHistory.findAll({
      include: [
        {
          model: Order,
          where: {
            customer_id,
            delete_status: 0,
            ...(startDate && endDate
              ? { createdAt: { [Op.between]: [startDate, endDate] } }
              : {}),
          },
          attributes: [],
        },
      ],
      where: { active_status: true,delete_status: 0 },
      attributes: [
        "order_status",
        [
          db.Sequelize.fn("COUNT", db.Sequelize.col("OrderStatusHistory_id")),
          "count",
        ],
      ],
      group: ["order_status"],
      raw: true,
    });

    // Structure the result to make it easier to read
    const result = {
      totalVolume: orderStats[0].totalVolume || 0,
      totalOrderCount: orderStats[0].totalOrderCount || 0,
      totalAmountOfProduct: orderStats[0].totalAmountOfProduct || 0,
      statusCounts: {
        ordered: 0,
        shipped: 0,
        delivered: 0,
      },
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

    RESPONSE.Success.Message = "Dashboard statistics retrieved successfully.";
    RESPONSE.Success.data = result;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("getDashboardStatsForCustomer:", error);
    RESPONSE.Failure.Message =
      error.message || "An error occurred while fetching dashboard statistics.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

exports.getAllOrdersByCustomerWithFilter = async (req, res) => {
  const { customer_id } = req.params;
  const { from_date, to_date } = req.body;

  // Initialize date variables
  let startDate;
  let endDate;

  if (from_date && to_date) {
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date(to_date + "T23:59:59");
  } else if (from_date) {
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date();
  } else if (to_date) {
    startDate = new Date("1970-01-01T00:00:00");
    endDate = new Date(to_date + "T23:59:59");
  }

  try {
    // Verify if the customer exists
    const customerExists = await Customer.findOne({
      where: { customer_id },
    });

    if (!customerExists) {
      RESPONSE.Failure.Message = "Customer not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    // Fetch all orders for the customer
    const orders = await Order.findAll({
      where: {
        customer_id,
        delete_status: 0,
        ...(startDate && endDate
          ? { createdAt: { [Op.between]: [startDate, endDate] } }
          : {}),
      },
      // attributes: [
      //   "order_id",
      //   "volume",
      //   "amountOfProduct",
      //   "createdAt",
      //   "updatedAt",
      // ],
      // raw: true,
    });

    RESPONSE.Success.Message = "Total orders retrieved successfully.";
    RESPONSE.Success.data = orders;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("getTotalOrdersForCustomer:", error);
    RESPONSE.Failure.Message =
      error.message || "An error occurred while fetching total orders.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// exports.getOrderedStatusOrdersForCustomerWithFilter = async (req, res) => {
//   const { customer_id } = req.params;

//   try {
//     // Verify if the customer exists
//     const customerExists = await Customer.findOne({
//       where: { customer_id },
//     });

//     if (!customerExists) {
//       RESPONSE.Failure.Message = "Customer not found.";
//       return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
//     }

//     // Fetch orders with "ordered" status
//     const orderedStatus = await OrderStatusHistory.findAll({
//       include: [
//         {
//           model: Order,
//           where: { customer_id, delete_status: 0 },
//           attributes: [], // Avoid including Order attributes again
//         },
//       ],
//       where: { active_status: true, order_status: "ordered" },
//       // attributes: ["OrderStatusHistory_id", "order_status"],
//       // raw: true,
//     });

//     RESPONSE.Success.Message = "Orders with 'ordered' status retrieved successfully.";
//     RESPONSE.Success.data = { orderedStatus };
//     res.status(StatusCode.OK.code).send(RESPONSE.Success);
//   } catch (error) {
//     console.error("getOrderedStatusForCustomer:", error);
//     RESPONSE.Failure.Message =
//       error.message || "An error occurred while fetching 'ordered' status.";
//     res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
//   }
// };

exports.getOrderedStatusOrdersForCustomerOrdersTimeWithFilter = async (
  req,
  res
) => {
  const { customer_id } = req.params;
  const { from_date, to_date } = req.body;

  // Initialize date variables
  let startDate;
  let endDate;

  if (from_date && to_date) {
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date(to_date + "T23:59:59");
  } else if (from_date) {
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date();
  } else if (to_date) {
    startDate = new Date("1970-01-01T00:00:00");
    endDate = new Date(to_date + "T23:59:59");
  }

  try {
    // Verify if the customer exists
    const customerExists = await Customer.findOne({
      where: { customer_id },
    });

    if (!customerExists) {
      RESPONSE.Failure.Message = "Customer not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    // Fetch orders with "ordered" status, filtered by date if provided
    const orderedStatus = await OrderStatusHistory.findAll({
      where: { active_status: true, order_status: "ordered",delete_status: 0 },
      include: [
        {
          model: Order,
          where: {
            customer_id,
            delete_status: 0,
            ...(startDate && endDate
              ? { createdAt: { [Op.between]: [startDate, endDate] } }
              : {}),
          },
        },
      ],
    });

    RESPONSE.Success.Message =
      "Orders with 'ordered' status retrieved successfully.";
    RESPONSE.Success.data = orderedStatus;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("getOrderedStatusForCustomer:", error);
    RESPONSE.Failure.Message =
      error.message || "An error occurred while fetching 'ordered' status.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

exports.getShippedStatusOrdersForCustomerOrdersTimeWithFilter = async (
  req,
  res
) => {
  const { customer_id } = req.params;
  const { from_date, to_date } = req.body;

  // Initialize date variables
  let startDate;
  let endDate;

  if (from_date && to_date) {
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date(to_date + "T23:59:59");
  } else if (from_date) {
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date();
  } else if (to_date) {
    startDate = new Date("1970-01-01T00:00:00");
    endDate = new Date(to_date + "T23:59:59");
  }

  try {
    // Verify if the customer exists
    const customerExists = await Customer.findOne({
      where: { customer_id },
    });

    if (!customerExists) {
      RESPONSE.Failure.Message = "Customer not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    // Fetch orders with "ordered" status, filtered by date if provided
    const orderedStatus = await OrderStatusHistory.findAll({
      where: { active_status: true, order_status: "shipped",delete_status: 0 },
      include: [
        {
          model: Order,
          where: {
            customer_id,
            delete_status: 0,
            ...(startDate && endDate
              ? { createdAt: { [Op.between]: [startDate, endDate] } }
              : {}),
          },
        },
      ],
    });

    RESPONSE.Success.Message =
      "Orders with shipped status retrieved successfully.";
    RESPONSE.Success.data = orderedStatus;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("getshippedStatusForCustomer:", error);
    RESPONSE.Failure.Message =
      error.message || "An error occurred while fetching shipped status.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

exports.getDeliveredStatusOrdersForCustomerOrdersTimeWithFilter = async (
  req,
  res
) => {
  const { customer_id } = req.params;
  const { from_date, to_date } = req.body;

  // Initialize date variables
  let startDate;
  let endDate;

  if (from_date && to_date) {
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date(to_date + "T23:59:59");
  } else if (from_date) {
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date();
  } else if (to_date) {
    startDate = new Date("1970-01-01T00:00:00");
    endDate = new Date(to_date + "T23:59:59");
  }

  try {
    // Verify if the customer exists
    const customerExists = await Customer.findOne({
      where: { customer_id },
    });

    if (!customerExists) {
      RESPONSE.Failure.Message = "Customer not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    // Fetch orders with "ordered" status, filtered by date if provided
    const orderedStatus = await OrderStatusHistory.findAll({
      where: { active_status: true, order_status: "delivered",delete_status: 0 },
      include: [
        {
          model: Order,
          where: {
            customer_id,
            delete_status: 0,
            ...(startDate && endDate
              ? { createdAt: { [Op.between]: [startDate, endDate] } }
              : {}),
          },
        },
      ],
    });

    RESPONSE.Success.Message =
      "Orders with delivered status retrieved successfully.";
    RESPONSE.Success.data =  orderedStatus ;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("getdeliveredStatusForCustomer:", error);
    RESPONSE.Failure.Message =
      error.message || "An error occurred while fetching delivered status.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// Operator -------------------------------------------------------------
exports.getDashboardStatsForOperatorWithFilter = async (req, res) => {
  const { operator_id } = req.params;
  const { from_date, to_date } = req.body;

  // Initialize date variables
  let startDate;
  let endDate;

  // If both from_date and to_date are provided
  if (from_date && to_date) {
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date(to_date + "T23:59:59");
  } else if (from_date) {
    // If only from_date is provided
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date(); // Get all until now
  } else if (to_date) {
    // If only to_date is provided
    startDate = new Date("1970-01-01T00:00:00"); // Get all from the beginning of time
    endDate = new Date(to_date + "T23:59:59");
  }

  try {
    // Check if the operator exists
    const operatorExists = await Operator.findOne({
      where: { operator_id },
    });

    if (!operatorExists) {
      RESPONSE.Failure.Message = "Operator not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    // Total order count from the Orders table based on operator_id
    const orderStats = await Order.findAll({
      where: {
        operator_id,
        delete_status: 0,
        ...(startDate && endDate
          ? { createdAt: { [Op.between]: [startDate, endDate] } }
          : {}),
      },
      attributes: [
        [
          db.Sequelize.fn("COUNT", db.Sequelize.col("order_id")),
          "totalOrderCount",
        ],
      ],
      raw: true,
    });

    // Total customer count from the customer_operator table based on operator_id
    const customerStats = await CustomerOperator.findAll({
      where: {
        operator_id,
        // delete_status: 0,
        ...(startDate && endDate
          ? {
              [Op.and]: [
                { createdAt: { [Op.lte]: endDate } },
                {
                  [Op.or]: [
                    { deletedAt: null },
                    { deletedAt: { [Op.gte]: startDate } },
                  ],
                },
              ],
            }
          : {}),
      },
      attributes: [
        [
          db.Sequelize.fn("COUNT", db.Sequelize.col("customer_id")),
          "totalCustomerCount",
        ],
      ],
      raw: true,
    });

    // Count of each status in the OrderStatusHistory table where active_status is true
    const statusCounts = await OrderStatusHistory.findAll({
      include: [
        {
          model: Order,
          where: {
            operator_id,
            delete_status: 0,
            ...(startDate && endDate
              ? { createdAt: { [Op.between]: [startDate, endDate] } }
              : {}),
          },
          attributes: [],
        },
      ],
      where: { active_status: true,delete_status: 0 },
      attributes: [
        "order_status",
        [
          db.Sequelize.fn("COUNT", db.Sequelize.col("OrderStatusHistory_id")),
          "count",
        ],
      ],
      group: ["order_status"],
      raw: true,
    });

    // Structure the result to make it easier to read
    const result = {
      totalOrderCount: orderStats[0].totalOrderCount || 0,
      totalCustomerCount: customerStats[0].totalCustomerCount || 0,
      statusCounts: {
        ordered: 0,
        shipped: 0,
        delivered: 0,
      },
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

    RESPONSE.Success.Message = "Dashboard statistics retrieved successfully.";
    RESPONSE.Success.data = result;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("getDashboardStatsForOperator:", error);
    RESPONSE.Failure.Message =
      error.message || "An error occurred while fetching dashboard statistics.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

exports.getAllOrdersByOperatorWithFilter = async (req, res) => {
  const { operator_id } = req.params;
  const { from_date, to_date } = req.body;

  let startDate, endDate;

  if (from_date && to_date) {
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date(to_date + "T23:59:59");
  } else if (from_date) {
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date();
  } else if (to_date) {
    startDate = new Date("1970-01-01T00:00:00");
    endDate = new Date(to_date + "T23:59:59");
  }

  try {
    const orders = await Order.findAll({
      where: {
        operator_id,
        delete_status: 0,
        ...(startDate && endDate
          ? { createdAt: { [Op.between]: [startDate, endDate] } }
          : {}),
      },
    });

    RESPONSE.Success.Message = "Orders retrieved successfully.";
    RESPONSE.Success.data = orders;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("getOrdersForOperator:", error);
    RESPONSE.Failure.Message =
      error.message || "An error occurred while fetching the orders.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// issue is their if admin update the operator to that customer after some
//  month , if we filter and  giving brfore update time that customer is
//  not showing for operator because we directly update

// ----
// to solve this when update we have to insret new row and when map the
// operaor to customer we have to consider last row for map customer

// -------------------- NOT SOLVED (25-10-24) -------------------

exports.getCustomersForOperatorWithFilter = async (req, res) => {
  const { operator_id } = req.params;
  const { from_date, to_date } = req.body;

  let startDate, endDate;

  if (from_date && to_date) {
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date(to_date + "T23:59:59");
  } else if (from_date) {
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date();
  } else if (to_date) {
    startDate = new Date("1970-01-01T00:00:00");
    endDate = new Date(to_date + "T23:59:59");
  }

  try {
    const customers = await CustomerOperator.findAll({
      where: {
        operator_id,
        // delete_status: 0,
        ...(startDate && endDate
          ? {
              [Op.and]: [
                { createdAt: { [Op.lte]: endDate } },
                {
                  [Op.or]: [
                    { deletedAt: null },
                    { deletedAt: { [Op.gte]: startDate } },
                  ],
                },
              ],
            }
          : {}),
      },
      include: [
        {
          model: Customer, // Assuming there is a Customer model
          // attributes: ["customer_id", "name", "email", "phone"], // Select necessary fields
          attributes: { exclude: ["password"] },
        },
      ],
    });

    RESPONSE.Success.Message = "Customers retrieved successfully.";
    RESPONSE.Success.data = customers;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("getCustomersForOperator:", error);
    RESPONSE.Failure.Message =
      error.message || "An error occurred while fetching the customers.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

exports.getOrderedStatusOrdersForOperatorOrdersTimeWithFilter = async (
  req,
  res
) => {
  const { operator_id } = req.params;
  const { from_date, to_date } = req.body;

  // Initialize date variables
  let startDate;
  let endDate;

  if (from_date && to_date) {
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date(to_date + "T23:59:59");
  } else if (from_date) {
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date();
  } else if (to_date) {
    startDate = new Date("1970-01-01T00:00:00");
    endDate = new Date(to_date + "T23:59:59");
  }

  try {
    // Verify if the customer exists
    const operatorExists = await Operator.findOne({
      where: { operator_id },
    });

    if (!operatorExists) {
      RESPONSE.Failure.Message = "Operator not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    // Fetch orders with "ordered" status, filtered by date if provided
    const orderedStatus = await OrderStatusHistory.findAll({
      where: { active_status: true, order_status: "ordered",delete_status: 0 },
      include: [
        {
          model: Order,
          where: {
            operator_id,
            delete_status: 0,
            ...(startDate && endDate
              ? { createdAt: { [Op.between]: [startDate, endDate] } }
              : {}),
          },
        },
      ],
    });

    RESPONSE.Success.Message =
      "Orders with ordered status retrieved successfully.";
    RESPONSE.Success.data = orderedStatus;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("getOrderedStatusForCustomer:", error);
    RESPONSE.Failure.Message =
      error.message || "An error occurred while fetching ordered status.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

exports.getShippedStatusOrdersForOperatorOrdersTimeWithFilter = async (
  req,
  res
) => {
  const { operator_id } = req.params;
  const { from_date, to_date } = req.body;

  // Initialize date variables
  let startDate;
  let endDate;

  if (from_date && to_date) {
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date(to_date + "T23:59:59");
  } else if (from_date) {
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date();
  } else if (to_date) {
    startDate = new Date("1970-01-01T00:00:00");
    endDate = new Date(to_date + "T23:59:59");
  }

  try {
    // Verify if the customer exists
    const operatorExists = await Operator.findOne({
      where: { operator_id },
    });

    if (!operatorExists) {
      RESPONSE.Failure.Message = "Operator not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    // Fetch orders with "ordered" status, filtered by date if provided
    const orderedStatus = await OrderStatusHistory.findAll({
      where: { active_status: true, order_status: "shipped",delete_status: 0 },
      include: [
        {
          model: Order,
          where: {
            operator_id,
            delete_status: 0,
            ...(startDate && endDate
              ? { createdAt: { [Op.between]: [startDate, endDate] } }
              : {}),
          },
        },
      ],
    });

    RESPONSE.Success.Message =
      "Orders with shipped status retrieved successfully.";
    RESPONSE.Success.data = orderedStatus;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("getshippedStatusForCustomer:", error);
    RESPONSE.Failure.Message =
      error.message || "An error occurred while fetching shipped status.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

exports.getDeliveredStatusOrdersForOperatorOrdersTimeWithFilter = async (
  req,
  res
) => {
  const { operator_id } = req.params;
  const { from_date, to_date } = req.body;

  // Initialize date variables
  let startDate;
  let endDate;

  if (from_date && to_date) {
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date(to_date + "T23:59:59");
  } else if (from_date) {
    startDate = new Date(from_date + "T00:00:00");
    endDate = new Date();
  } else if (to_date) {
    startDate = new Date("1970-01-01T00:00:00");
    endDate = new Date(to_date + "T23:59:59");
  }

  try {
    // Verify if the customer exists
    const operatorExists = await Operator.findOne({
      where: { operator_id },
    });

    if (!operatorExists) {
      RESPONSE.Failure.Message = "Operator not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    // Fetch orders with "ordered" status, filtered by date if provided
    const orderedStatus = await OrderStatusHistory.findAll({
      where: { active_status: true, order_status: "delivered",delete_status: 0 },
      include: [
        {
          model: Order,
          where: {
            operator_id,
            delete_status: 0,
            ...(startDate && endDate
              ? { createdAt: { [Op.between]: [startDate, endDate] } }
              : {}),
          },
        },
      ],
    });

    RESPONSE.Success.Message =
      "Orders with delivered status retrieved successfully.";
    RESPONSE.Success.data = orderedStatus;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("getdeliveredStatusForCustomer:", error);
    RESPONSE.Failure.Message =
      error.message || "An error occurred while fetching delivered status.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};
