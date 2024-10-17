const db = require("../models");
const Order = db.orders; // Reference to the Order model
const CustomerOperator = db.customerOperator;
const OrderStatusHistory = db.orderStatusHistory;
const Customer = db.customers
// Create a new order
// exports.createOrder = async (req, res) => {
//   try {
//     const {
//       customer_id,
//       fuelType,
//       required_date,
//       volume,
//       station,
//       paymentStatus,
//     } = req.body;

//     // Validate required fields
//     if (
//       !customer_id ||
//       !fuelType ||
//       !required_date ||
//       !volume ||
//       !station ||
//       !paymentStatus
//     ) {
//       return res.status(400).json({
//         Status: false,
//         Success: false,
//         Message: "All fields are required.",
//         Error: "Validation Error",
//       });
//     }

//     // Check if the customer has an assigned operator
//     const customerOperator = await CustomerOperator.findOne({
//       where: { customer_id, delete_status: 0 },
//     });

//     const order = await Order.create({
//       customer_id,
//       operator_id: customerOperator ? customerOperator.operator_id : null, // Assign operator if available
//       fuelType,
//       required_date,
//       volume,
//       station,
//       paymentStatus,
//     });

//     return res.status(201).json({
//       Status: true,
//       Success: true,
//       Message: "Order created successfully.",
//       data: order,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       Status: false,
//       Success: false,
//       Message: "Error creating order.",
//       Error: error.message,
//     });
//   }
// };

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const {
      customer_id,
      fuelType,
      required_date,
      volume,
      station,
      paymentStatus,
    } = req.body;

    // Validate required fields
    if (
      !customer_id ||
      !fuelType ||
      !required_date ||
      !volume ||
      !station ||
      !paymentStatus
    ) {
      return res.status(400).json({
        Status: false,
        Success: false,
        Message: "All fields are required.",
        Error: "Validation Error",
      });
    }

    // Check if the customer has an assigned operator
    const customerOperator = await CustomerOperator.findOne({
      where: { customer_id, delete_status: 0 },
    });

    // Create the order
    const order = await Order.create({
      customer_id,
      operator_id: customerOperator ? customerOperator.operator_id : null, // Assign operator if available
      fuelType,
      required_date,
      volume,
      station,
      paymentStatus,
    });

    // Create the initial status history entry for "ordered"
    await OrderStatusHistory.create({
      order_id: order.order_id, // Assuming order_id is the primary key in the Order table
      order_status: "ordered",
      timestamp: new Date(),
      active_status: true, // Assuming active_status is required
      dateOfRequired: required_date, // Pass required_date to dateOfRequired
      tracing_status:true
    });

    // Create the status history entry for other statuses with null timestamps
    await OrderStatusHistory.create({
      order_id: order.order_id,
      order_status: "shipped",
      timestamp: null,
      active_status: false, // Set to false or true as per your requirements
      dateOfRequired: required_date, // No date required at this stage
      tracing_status:false
    });

    await OrderStatusHistory.create({
      order_id: order.order_id,
      order_status: "delivered",
      timestamp: null,
      active_status: false, // Set to false or true as per your requirements
      dateOfRequired: required_date, // No date required at this stage
      tracing_status:false
    });

    return res.status(201).json({
      Status: true,
      Success: true,
      Message: "Order created successfully.",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      Status: false,
      Success: false,
      Message: "Error creating order.",
      Error: error.message,
    });
  }
};

// Get all active orders (not deleted)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({ where: { delete_status: 0 } });
    return res.status(200).json({
      Status: true,
      Success: true,
      Message: "Active orders retrieved successfully.",
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      Status: false,
      Success: false,
      Message: "Error retrieving active orders.",
      Error: error.message,
    });
  }
};

// Get all orders
// exports.getAllOrders = async (req, res) => {
//   try {
//     const orders = await Order.findAll();
//     return res.status(200).json({
//       Status: true,
//       Success: true,
//       Message: 'Orders retrieved successfully.',
//       data: orders
//     });
//   } catch (error) {
//     return res.status(500).json({
//       Status: false,
//       Success: false,
//       Message: 'Error retrieving orders.',
//       Error: error.message
//     });
//   }
// };

// Get a specific order by ID
exports.getOrderById = async (req, res) => {
  const { order_id } = req.params;

  try {
    const order = await Order.findOne({ where: { order_id } });
    if (!order) {
      return res.status(404).json({
        Status: false,
        Success: false,
        Message: "Order not found.",
        Error: "Not Found",
      });
    }
    return res.status(200).json({
      Status: true,
      Success: true,
      Message: "Order retrieved successfully.",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      Status: false,
      Success: false,
      Message: "Error retrieving order.",
      Error: error.message,
    });
  }
};

// Update an existing order
exports.updateOrder = async (req, res) => {
  const { order_id } = req.params;
  const {
    fuelType,
    required_date,
    volume,
    station,
    paymentStatus,
    order_status,
  } = req.body;

  try {
    const order = await Order.findOne({ where: { order_id } });
    if (!order) {
      return res.status(404).json({
        Status: false,
        Success: false,
        Message: "Order not found.",
        Error: "Not Found",
      });
    }

    await Order.update(
      {
        fuelType: fuelType || order.fuelType,
        required_date: required_date || order.required_date,
        volume: volume || order.volume,
        station: station || order.station,
        paymentStatus: paymentStatus || order.paymentStatus,
        order_status: order_status || order.order_status,
        updatedAt: new Date(),
      },
      { where: { order_id } }
    );

    return res.status(200).json({
      Status: true,
      Success: true,
      Message: "Order updated successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      Status: false,
      Success: false,
      Message: "Error updating order.",
      Error: error.message,
    });
  }
};

// Soft delete an order
exports.deleteOrder = async (req, res) => {
  const { order_id } = req.params;

  try {
    const order = await Order.findOne({ where: { order_id } });
    if (!order) {
      return res.status(404).json({
        Status: false,
        Success: false,
        Message: "Order not found.",
        Error: "Not Found",
      });
    }

    // Update the delete_status field to 1 to mark as deleted
    await Order.update({ delete_status: 1 }, { where: { order_id } });

    return res.status(200).json({
      Status: true,
      Success: true,
      Message: "Order deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      Status: false,
      Success: false,
      Message: "Error deleting order.",
      Error: error.message,
    });
  }
};

// controllers/orders.controller.js

exports.getAllOrdersForOperator = async (req, res) => {
  const { operator_id } = req.params;

  try {
    // Fetch all orders assigned to the specified operator
    const orders = await Order.findAll({
      where: { operator_id, delete_status: 0 },
    });

    // Check if any orders are found
    if (!orders || orders.length === 0) {
      return res.status(404).json({
        Status: false,
        Success: false,
        Message: "No orders found for the specified operator.",
      });
    }

    return res.status(200).json({
      Status: true,
      Success: true,
      Message: "Orders fetched successfully.",
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      Status: false,
      Success: false,
      Message: "Error while fetching orders.",
      Error: error.message,
    });
  }
};

// Get all orders based on customer_id
exports.getAllOrdersByCustomer = async (req, res) => {
  const { customer_id } = req.params;

  try {
    // Fetch all orders for the specified customer
    const orders = await Order.findAll({
      where: {
        customer_id,
        delete_status: 0, // Ensure only active orders are fetched
      },
    });

    // Check if any orders were found
    if (orders.length === 0) {
      return res.status(404).json({
        message: "No orders found for this customer.",
      });
    }

    return res.status(200).json({
      message: "Orders retrieved successfully.",
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while fetching the orders.",
      error: error.message,
    });
  }
};


// Update order status and track the status change history
// exports.updateOrderStatusWithTime = async (req, res) => {
//   const { order_id } = req.params;
//   const { order_status, orderStatusHistory_id } = req.body;

//   // Allowed status values
//   const allowedStatuses = ["ordered","shipped","delivered"]; //["ordered","shipped","delivered"];

//   try {
//     // Validate the new status
//     if (!allowedStatuses.includes(order_status)) {
//       return res.status(400).json({
//         Status: false,
//         Success: false,
//         Message: "Invalid order status. Allowed statuses are: ordered, shipped, out for delivery, delivered.",
//       });
//     }

//     // Update the order status
//     const [updatedRows] = await Order.update(
//       { order_status },
//       { where: { order_id, delete_status: 0 } }
//     );

//     if (updatedRows === 0) {
//       return res.status(404).json({
//         Status: false,
//         Success: false,
//         Message: "Order not found or already deleted.",
//       });
//     }

//     // Update the OrderStatusHistory instead of creating a new entry
//     const [updatedHistoryRows] = await OrderStatusHistory.update(
//       {
//         order_status,
//         timestamp: new Date(),
//         active_status: true, // Assuming you want to set this to true for the latest status
//         // dateOfRequired can be set if needed
//         // dateOfRequired: some_value, // Pass as necessary
//       },
//       {
//         where: { 
//           orderStatusHistory_id, // Ensure you're matching the correct record
//         },
//       }
//     );

//     if (updatedHistoryRows === 0) {
//       return res.status(404).json({
//         Status: false,
//         Success: false,
//         Message: "Order status history not found.",
//       });
//     }

//     res.status(200).json({
//       Status: true,
//       Success: true,
//       Message: "Order status updated and history recorded successfully.",
//     });
//   } catch (error) {
//     res.status(500).json({
//       Status: false,
//       Success: false,
//       Message: "An error occurred while updating the order status.",
//       Error: error.message,
//     });
//   }
// };

// Update order status and track the status change history
exports.updateOrderStatusWithTime = async (req, res) => {
  const { order_id } = req.params;
  const { order_status, orderStatusHistory_id } = req.body;

  // Allowed status values
  const allowedStatuses = ["ordered", "shipped", "delivered"];

  try {
    // Validate the new status
    if (!allowedStatuses.includes(order_status)) {
      return res.status(400).json({
        Status: false,
        Success: false,
        Message: "Invalid order status. Allowed statuses are: ordered, shipped, delivered.",
      });
    }

    // Update the order status
    const [updatedRows] = await Order.update(
      { order_status },
      { where: { order_id, delete_status: 0 } }
    );

    if (updatedRows === 0) {

      // console.log("hiiiiii",updatedRows);
      
      return res.status(404).json({
        Status: false,
        Success: false,
        Message: "Order not found or already deleted.",
      });
    }

    // Find the associated order_id and current order_status from OrderStatusHistory
    const orderStatusHistory = await OrderStatusHistory.findOne({
      where: { orderStatusHistory_id },
    });

    if (!orderStatusHistory) {
      return res.status(404).json({
        Status: false,
        Success: false,
        Message: "Order status history not found.",
      });
    }

    const { order_id: associatedOrderId, order_status: currentStatus } = orderStatusHistory;

    // Update the OrderStatusHistory for the specific record
    const [updatedHistoryRows] = await OrderStatusHistory.update(
      {
        order_status,
        timestamp: new Date(),
        active_status: true, // Set active_status to true for the current update
        tracing_status:true
      },
      {
        where: { 
          orderStatusHistory_id,
        },
      }
    );

    if (updatedHistoryRows === 0) {
      return res.status(404).json({
        Status: false,
        Success: false,
        Message: "Order status history not found.",
      });
    }

    // Set active_status to false for other statuses associated with the same order
    await OrderStatusHistory.update(
      { active_status: false },
      {
        where: {
          order_id: associatedOrderId,
          orderStatusHistory_id: { [db.Sequelize.Op.ne]: orderStatusHistory_id }, // Exclude the current record
          order_status: { [db.Sequelize.Op.ne]: currentStatus }, // Exclude the current status dynamically
        },
      }
    );

    res.status(200).json({
      Status: true,
      Success: true,
      Message: "Order status updated and history recorded successfully.",
    });
  } catch (error) {
    res.status(500).json({
      Status: false,
      Success: false,
      Message: "An error occurred while updating the order status.",
      Error: error.message,
    });
  }
};



exports.getDashboardStatsForCustomer = async (req, res) => {
  const { customer_id } = req.params;

  try {
    // Check if the customer exists
    const customerExists = await Customer.findOne({
      where: { customer_id },
    });

    if (!customerExists) {
      return res.status(404).json({
        Status: false,
        Success: false,
        Message: "Customer not found.",
      });
    }


 
    // Total volume count and total order count from the orders table
    const orderStats = await Order.findAll({
      where: { customer_id, delete_status: 0 },
      attributes: [
        [db.Sequelize.fn("SUM", db.Sequelize.col("volume")), "totalVolume"],
        [db.Sequelize.fn("COUNT", db.Sequelize.col("order_id")), "totalOrderCount"],
      ],
      raw: true,
    });

    // Count of each status in the OrderStatusHistory table where active_status is true
    const statusCounts = await OrderStatusHistory.findAll({
      include: [
        {
          model: Order,
          where: { customer_id, delete_status: 0 },
          attributes: [],
        },
      ],
      where: { active_status: true },
      attributes: [
        "order_status",
        [db.Sequelize.fn("COUNT", db.Sequelize.col("OrderStatusHistory_id")), "count"],
      ],
      group: ["order_status"],
      raw: true,
    });

    // Structure the result to make it easier to read
    const result = {
      totalVolume: orderStats[0].totalVolume || 0,
      totalOrderCount: orderStats[0].totalOrderCount || 0,
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

    res.status(200).json({
      Status: true,
      Success: true,
      Message: "Dashboard statistics retrieved successfully.",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      Status: false,
      Success: false,
      Message: "An error occurred while fetching dashboard statistics.",
      Error: error.message,
    });
  }
};

// Get dashboard statistics for a specific operator
exports.getDashboardStatsForOperator = async (req, res) => {
  const { operator_id } = req.params;

  try {
    // Check if the operator exists
    const operatorExists = await CustomerOperator.findOne({
      where: { operator_id, delete_status: 0 },
    });

    if (!operatorExists) {
      return res.status(404).json({
        Status: false,
        Success: false,
        Message: "Operator not found.",
      });
    }

    // Total order count from the orders table based on operator_id
    const orderStats = await Order.findAll({
      where: { operator_id, delete_status: 0 },
      attributes: [
        [db.Sequelize.fn("COUNT", db.Sequelize.col("order_id")), "totalOrderCount"],
      ],
      raw: true,
    });

    // Total customer count from the customer_operator table based on operator_id
    const customerStats = await CustomerOperator.findAll({
      where: { operator_id, delete_status: 0 },
      attributes: [
        [db.Sequelize.fn("COUNT", db.Sequelize.col("customer_id")), "totalCustomerCount"],
      ],
      raw: true,
    });

    // Count of each status in the OrderStatusHistory table where active_status is true
    const statusCounts = await OrderStatusHistory.findAll({
      include: [
        {
          model: Order,
          where: { operator_id, delete_status: 0 },
          attributes: [],
        },
      ],
      where: { active_status: true },
      attributes: [
        "order_status",
        [db.Sequelize.fn("COUNT", db.Sequelize.col("OrderStatusHistory_id")), "count"],
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

    res.status(200).json({
      Status: true,
      Success: true,
      Message: "Dashboard statistics retrieved successfully.",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      Status: false,
      Success: false,
      Message: "An error occurred while fetching dashboard statistics.",
      Error: error.message,
    });
  }
};

