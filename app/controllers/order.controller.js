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
      amountOfProduct,
      paymentProofImages,
    } = req.body;

    // Validate required fields
    if (
      !customer_id ||
      !fuelType ||
      !required_date ||
      !volume ||
      !station ||
      !paymentStatus ||
      !amountOfProduct
    ) {
      RESPONSE.Failure.Message = "All fields are required.";
      return res.status(StatusCode.BAD_REQUEST.code).send(RESPONSE.Failure);
      // return res.status(400).json({
      //   Status: false,
      //   Success: false,
      //   Message: "All fields are required.",
      //   Error: "Validation Error",
      // });
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
      amountOfProduct,
      paymentProofImages,
    });

    // Create the initial status history entry for "ordered"
    await OrderStatusHistory.create({
      order_id: order.order_id, // Assuming order_id is the primary key in the Order table
      order_status: "ordered",
      timestamp: new Date(),
      active_status: true, // Assuming active_status is required
      dateOfRequired: required_date, // Pass required_date to dateOfRequired
      tracing_status: true,
    });

    // Create the status history entry for other statuses with null timestamps
    await OrderStatusHistory.create({
      order_id: order.order_id,
      order_status: "shipped",
      timestamp: null,
      active_status: false, // Set to false or true as per your requirements
      dateOfRequired: required_date, // No date required at this stage
      tracing_status: false,
    });

    await OrderStatusHistory.create({
      order_id: order.order_id,
      order_status: "delivered",
      timestamp: null,
      active_status: false, // Set to false or true as per your requirements
      dateOfRequired: required_date, // No date required at this stage
      tracing_status: false,
    });

    RESPONSE.Success.Message = "Order created successfully.";
    RESPONSE.Success.data = order;
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // return res.status(201).json({
    //   Status: true,
    //   Success: true,
    //   Message: "Order created successfully.",
    //   data: order,
    // });
  } catch (error) {
    console.error("createOrder:", error);
    RESPONSE.Failure.Message = error.message || "Error creating order.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // return res.status(500).json({
    //   Status: false,
    //   Success: false,
    //   Message: "Error creating order.",
    //   Error: error.message,
    // });
  }
};

// Get all active orders (not deleted)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({ where: { delete_status: 0 } });
    RESPONSE.Success.Message = "Active orders retrieved successfully.";
    RESPONSE.Success.data = orders;
    // console.log(orders);

    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // return res.status(200).json({
    //   Status: true,
    //   Success: true,
    //   Message: "Active orders retrieved successfully.",
    //   data: orders,
    // });
  } catch (error) {
    console.error("getAllOrders:", error);
    RESPONSE.Failure.Message =
      error.message || "Error retrieving active orders.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // return res.status(500).json({
    //   Status: false,
    //   Success: false,
    //   Message: "Error retrieving active orders.",
    //   Error: error.message,
    // });
  }
};

// Get all active orders with their customer and operator details
exports.getAllOrdersWithCustomerAndOperatorDetails = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { delete_status: 0 }, // Fetch active orders
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
      RESPONSE.Failure.Message = "Order not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
      // return res.status(404).json({
      //   Status: false,
      //   Success: false,
      //   Message: "Order not found.",
      //   Error: "Not Found",
      // });
    }
    RESPONSE.Success.Message = "Order retrieved successfully.";
    RESPONSE.Success.data = order;
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // return res.status(200).json({
    //   Status: true,
    //   Success: true,
    //   Message: "Order retrieved successfully.",
    //   data: order,
    // });
  } catch (error) {
    console.error("getOrderById:", error);
    RESPONSE.Failure.Message = error.message || "Error retrieving order.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // return res.status(500).json({
    //   Status: false,
    //   Success: false,
    //   Message: "Error retrieving order.",
    //   Error: error.message,
    // });
  }
};

// Update an existing order
// exports.updateOrder = async (req, res) => {
//   const { order_id } = req.params;
//   const {
//     fuelType,
//     required_date,
//     volume,
//     station,
//     paymentStatus,
//     order_status,
//   } = req.body;

//   try {
//     const order = await Order.findOne({ where: { order_id } });
//     if (!order) {
//       RESPONSE.Failure.Message = "Order not found.";
//       return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
//       // return res.status(404).json({
//       //   Status: false,
//       //   Success: false,
//       //   Message: "Order not found.",
//       //   Error: "Not Found",
//       // });
//     }

//     await Order.update(
//       {
//         fuelType: fuelType || order.fuelType,
//         required_date: required_date || order.required_date,
//         volume: volume || order.volume,
//         station: station || order.station,
//         paymentStatus: paymentStatus || order.paymentStatus,
//         order_status: order_status || order.order_status,
//         updatedAt: new Date(),
//       },
//       { where: { order_id } }
//     );
//     RESPONSE.Success.Message = "Order updated successfully.";
//     RESPONSE.Success.data = {};
//     return res.status(StatusCode.OK.code).send(RESPONSE.Success);
//     // return res.status(200).json({
//     //   Status: true,
//     //   Success: true,
//     //   Message: "Order updated successfully.",
//     // });
//   } catch (error) {
//     console.error("updateOrder:", error);
//     RESPONSE.Failure.Message = error.message || "Error updating order.";
//     return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
//     // return res.status(500).json({
//     //   Status: false,
//     //   Success: false,
//     //   Message: "Error updating order.",
//     //   Error: error.message,
//     // });
//   }
// };

exports.updateOrder = async (req, res) => {
  const { order_id } = req.params;

  try {
    // Check if the order exists
    const order = await Order.findOne({ where: { order_id } });
    if (!order) {
      RESPONSE.Failure.Message = "Order not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    // Update the order directly with req.body
    const [updated] = await Order.update(req.body, {
      where: { order_id },
    });

    // Check if the update was successful
    if (updated) {
      RESPONSE.Success.Message = "Order updated successfully.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    } else {
      RESPONSE.Failure.Message = "Order update failed.";
      return res.status(StatusCode.BAD_REQUEST.code).send(RESPONSE.Failure);
    }
  } catch (error) {
    console.error("updateOrder:", error);
    RESPONSE.Failure.Message = error.message || "Error updating order.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

exports.updateOrderPaymentProofImages = async (req, res) => {
  const { order_id } = req.params;
  const { paymentProofImages } = req.body; // Expecting an array of image objects

  try {
    if (!Array.isArray(paymentProofImages)) {
      RESPONSE.Failure.Message = '"paymentProofImages" should be an array.';
      return res.status(StatusCode.BAD_REQUEST.code).send(RESPONSE.Failure);
    }

    // Fetch the existing order
    const order = await Order.findOne({ where: { order_id } });
    if (!order) {
      RESPONSE.Failure.Message = "Order not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    // Parse existing paymentProofImages if available, or start with an empty array
    let existingImages = [];
    if (order.paymentProofImages) {
      existingImages = JSON.parse(order.paymentProofImages);
    }

    // Add new images to the existing array
    existingImages = existingImages.concat(paymentProofImages);

    // Update the paymentProofImages in the database
    await Order.update(
      { paymentProofImages: existingImages, updatedAt: new Date() },
      { where: { order_id } }
    );

    RESPONSE.Success.Message = "Payment proof images updated successfully.";
    RESPONSE.Success.data = { paymentProofImages: existingImages };
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("updatePaymentProofImages:", error);
    RESPONSE.Failure.Message =
      error.message || "Error updating payment proof images.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// Update the operator_id for a specific order
exports.updateOrderToOperator = async (req, res) => {
  const { order_id } = req.params;
  const { operator_id } = req.body;

  try {
    // Check if the order exists
    const order = await Order.findOne({ where: { order_id } });
    if (!order) {
      RESPONSE.Failure.Message = "Order not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    // Update the operator_id for the order
    await Order.update(
      {
        operator_id: operator_id,
        updatedAt: new Date(),
      },
      { where: { order_id } }
    );

    RESPONSE.Success.Message = "Operator ID updated successfully.";
    RESPONSE.Success.data = {};
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("updateOrderOperator:", error);
    RESPONSE.Failure.Message = error.message || "Error updating operator ID.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// Soft delete an order
exports.deleteOrder = async (req, res) => {
  const { order_id } = req.params;

  try {
    const order = await Order.findOne({ where: { order_id } });
    if (!order) {
      RESPONSE.Failure.Message = "Order not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
      // return res.status(404).json({
      //   Status: false,
      //   Success: false,
      //   Message: "Order not found.",
      //   Error: "Not Found",
      // });
    }

    // Update the delete_status field to 1 to mark as deleted
    await Order.update({ delete_status: 1 }, { where: { order_id } });

    // Soft delete related OrderStatusHistory entries
    await OrderStatusHistory.update(
      { delete_status: 1 },
      { where: { order_id } }
    );

    RESPONSE.Success.Message = "Order deleted successfully.";
    RESPONSE.Success.data = {};
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // return res.status(200).json({
    //   Status: true,
    //   Success: true,
    //   Message: "Order deleted successfully.",
    // });
  } catch (error) {
    console.error("deleteOrder:", error);
    RESPONSE.Failure.Message = error.message || "Error deleting order.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // return res.status(500).json({
    //   Status: false,
    //   Success: false,
    //   Message: "Error deleting order.",
    //   Error: error.message,
    // });
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
      RESPONSE.Success.Message = "No orders found for the specified operator.";
      RESPONSE.Success.data = [];
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);

      // RESPONSE.Failure.Message = "No orders found for the specified operator.";
      // return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);

      // return res.status(404).json({
      //   Status: false,
      //   Success: false,
      //   Message: "No orders found for the specified operator.",
      // });
    }
    RESPONSE.Success.Message = "Orders fetched successfully.";
    RESPONSE.Success.data = orders;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // return res.status(200).json({
    //   Status: true,
    //   Success: true,
    //   Message: "Orders fetched successfully.",
    //   data: orders,
    // });
  } catch (error) {
    console.error("getAllOrdersForOperator:", error);
    RESPONSE.Failure.Message = error.message || "Error while fetching orders.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // return res.status(500).json({
    //   Status: false,
    //   Success: false,
    //   Message: "Error while fetching orders.",
    //   Error: error.message,
    // });
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
      RESPONSE.Success.Message = "No orders found for this customer.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      // RESPONSE.Failure.Message = "No orders found for this customer.";
      // return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
      // return res.status(404).json({
      //   message: "No orders found for this customer.",
      // });
    }

    RESPONSE.Success.Message = "Orders retrieved successfully.";
    RESPONSE.Success.data = orders;
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // return res.status(200).json({
    //   message: "Orders retrieved successfully.",
    //   data: orders,
    // });
  } catch (error) {
    console.error("getAllOrdersByCustomer:", error);
    RESPONSE.Failure.Message =
      error.message || "An error occurred while fetching the orders.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // return res.status(500).json({
    //   message: "An error occurred while fetching the orders.",
    //   error: error.message,
    // });
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
      RESPONSE.Failure.Message =
        "Invalid order status. Allowed statuses are: ordered, shipped, delivered.";
      return res.status(StatusCode.BAD_REQUEST.code).send(RESPONSE.Failure);
      // return res.status(400).json({
      //   Status: false,
      //   Success: false,
      //   Message:
      //     "Invalid order status. Allowed statuses are: ordered, shipped, delivered.",
      // });
    }

    // Update the order status
    const [updatedRows] = await Order.update(
      { order_status },
      { where: { order_id, delete_status: 0 } }
    );

    if (updatedRows === 0) {
      // console.log("hiiiiii",updatedRows);
      RESPONSE.Failure.Message = "Order not found or already deleted.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
      // return res.status(404).json({
      //   Status: false,
      //   Success: false,
      //   Message: "Order not found or already deleted.",
      // });
    }

    // Find the associated order_id and current order_status from OrderStatusHistory
    const orderStatusHistory = await OrderStatusHistory.findOne({
      where: { orderStatusHistory_id,delete_status: 0 },
    });

    if (!orderStatusHistory) {
      RESPONSE.Failure.Message = "Order status history not found";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
      // return res.status(404).json({
      //   Status: false,
      //   Success: false,
      //   Message: "Order status history not found.",
      // });
    }

    const { order_id: associatedOrderId, order_status: currentStatus } =
      orderStatusHistory;

    // Update the OrderStatusHistory for the specific record
    const [updatedHistoryRows] = await OrderStatusHistory.update(
      {
        order_status,
        timestamp: new Date(),
        active_status: true, // Set active_status to true for the current update
        tracing_status: true,
      },
      {
        where: {
          orderStatusHistory_id,delete_status: 0
        },
      }
    );

    if (updatedHistoryRows === 0) {
      RESPONSE.Failure.Message = "Order status history not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
      // return res.status(404).json({
      //   Status: false,
      //   Success: false,
      //   Message: "Order status history not found.",
      // });
    }

    // Set active_status to false for other statuses associated with the same order
    await OrderStatusHistory.update(
      { active_status: false },
      {
        where: {
          order_id: associatedOrderId,
          orderStatusHistory_id: {
            [db.Sequelize.Op.ne]: orderStatusHistory_id,
          }, // Exclude the current record
          order_status: { [db.Sequelize.Op.ne]: currentStatus }, // Exclude the current status dynamically
          delete_status: 0,
        },
      }
    );
    RESPONSE.Success.Message =
      "Order status updated and history recorded successfully.";
    RESPONSE.Success.data = {};
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // res.status(200).json({
    //   Status: true,
    //   Success: true,
    //   Message: "Order status updated and history recorded successfully.",
    // });
  } catch (error) {
    console.error("updateOrderStatusWithTime:", error);
    RESPONSE.Failure.Message =
      error.message || "An error occurred while updating the order status.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res.status(500).json({
    //   Status: false,
    //   Success: false,
    //   Message: "An error occurred while updating the order status.",
    //   Error: error.message,
    // });
  }
};

exports.getDashboardStatsForCustomer = async (req, res) => {
  const { customer_id } = req.params;

  try {
    // Check if the customer exists
    const customerExists = await Customer.findOne({
      where: { customer_id, delete_status: 0 },
    });

    if (!customerExists) {
      RESPONSE.Failure.Message = "Customer not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
      // return res.status(404).json({
      //   Status: false,
      //   Success: false,
      //   Message: "Customer not found.",
      // });
    }

    // Total volume count and total order count from the orders table
    const orderStats = await Order.findAll({
      where: { customer_id, delete_status: 0 },
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
          where: { customer_id, delete_status: 0 },
          attributes: [],
        },
      ],
      where: { active_status: true ,delete_status: 0,},
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
    // res.status(200).json({
    //   Status: true,
    //   Success: true,
    //   Message: "Dashboard statistics retrieved successfully.",
    //   data: result,
    // });
  } catch (error) {
    console.error("getDashboardStatsForCustomer:", error);
    RESPONSE.Failure.Message =
      error.message || "An error occurred while fetching dashboard statistics.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res.status(500).json({
    //   Status: false,
    //   Success: false,
    //   Message: "An error occurred while fetching dashboard statistics.",
    //   Error: error.message,
    // });
  }
};

// Get dashboard statistics for a specific operator
exports.getDashboardStatsForOperator = async (req, res) => {
  const { operator_id } = req.params;

  try {
    // Check if the operator exists
    const operatorExists = await Operator.findOne({
      where: { operator_id, delete_status: 0 },
    });

    if (!operatorExists) {
      RESPONSE.Failure.Message = "Operator not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
      // return res.status(404).json({
      //   Status: false,
      //   Success: false,
      //   Message: "Operator not found.",
      // });
    }

    // Total order count from the orders table based on operator_id
    const orderStats = await Order.findAll({
      where: { operator_id, delete_status: 0 },
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
      where: { operator_id, delete_status: 0 },
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
          where: { operator_id, delete_status: 0 },
          attributes: [],
        },
      ],
      where: { active_status: true,delete_status: 0, },
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
    // res.status(200).json({
    //   Status: true,
    //   Success: true,
    //   Message: "Dashboard statistics retrieved successfully.",
    //   data: result,
    // });
  } catch (error) {
    console.error("getDashboardStatsForOperator:", error);
    RESPONSE.Failure.Message =
      error.message || "An error occurred while fetching dashboard statistics.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res.status(500).json({
    //   Status: false,
    //   Success: false,
    //   Message: "An error occurred while fetching dashboard statistics.",
    //   Error: error.message,
    // });
  }
};

exports.getOrderedStatusOrdersForOperator = async (req, res) => {
  const { operator_id } = req.params;

  try {
    // Fetch all orders with "ordered" status for the given operator
    const orders = await Order.findAll({
      where: { operator_id, order_status: "ordered", delete_status: 0 },
    });

    RESPONSE.Success.Message = "Ordered status orders retrieved successfully.";
    RESPONSE.Success.data = orders;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // res.status(200).json({
    //   message: "Ordered status orders retrieved successfully.",
    //   data: orders,
    // });
  } catch (error) {
    console.error("getOrderedStatusOrdersForOperator:", error);
    RESPONSE.Failure.Message =
      error.message ||
      "An error occurred while fetching ordered status orders.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res.status(500).json({
    //   message: "An error occurred while fetching ordered status orders.",
    //   error: error.message,
    // });
  }
};

exports.getShippedStatusOrdersForOperator = async (req, res) => {
  const { operator_id } = req.params;

  try {
    // Fetch all orders with "shipped" status for the given operator
    const orders = await Order.findAll({
      where: { operator_id, order_status: "shipped", delete_status: 0 },
    });

    RESPONSE.Success.Message = "Shipped status orders retrieved successfully.";
    RESPONSE.Success.data = orders;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // res.status(200).json({
    //   message: "Shipped status orders retrieved successfully.",
    //   data: orders,
    // });
  } catch (error) {
    console.error("getShippedStatusOrdersForOperator:", error);
    RESPONSE.Failure.Message =
      error.message ||
      "An error occurred while fetching shipped status orders.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res.status(500).json({
    //   message: "An error occurred while fetching shipped status orders.",
    //   error: error.message,
    // });
  }
};

exports.getDeliveredStatusOrdersForOperator = async (req, res) => {
  const { operator_id } = req.params;

  try {
    // Fetch all orders with "delivered" status for the given operator
    const orders = await Order.findAll({
      where: { operator_id, order_status: "delivered", delete_status: 0 },
    });

    RESPONSE.Success.Message =
      "Delivered status orders retrieved successfully.";
    RESPONSE.Success.data = orders;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // res.status(200).json({
    //   message: "Delivered status orders retrieved successfully.",
    //   data: orders,
    // });
  } catch (error) {
    console.error("getDeliveredStatusOrdersForOperator:", error);
    RESPONSE.Failure.Message =
      error.message ||
      "An error occurred while fetching delivered status orders.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res.status(500).json({
    //   message: "An error occurred while fetching delivered status orders.",
    //   error: error.message,
    // });
  }
};

exports.getOrderedStatusOrdersForCustomer = async (req, res) => {
  const { customer_id } = req.params;

  try {
    // Fetch all "ordered" status orders for the given customer
    const orders = await Order.findAll({
      where: { customer_id, order_status: "ordered", delete_status: 0 },
    });

    // // Check if no orders are found
    // if (orders.length === 0) {
    //   return res.status(404).json({
    //     message: "No 'ordered' status orders found for the specified customer.",
    //   });
    // }

    RESPONSE.Success.Message = "Ordered' status orders retrieved successfully.";
    RESPONSE.Success.data = orders;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // res.status(200).json({
    //   message: "'Ordered' status orders retrieved successfully.",
    //   data: orders,
    // });
  } catch (error) {
    console.error("getOrderedStatusOrdersForCustomer:", error);
    RESPONSE.Failure.Message =
      error.message ||
      "An error occurred while fetching 'ordered' status orders.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res.status(500).json({
    //   message: "An error occurred while fetching 'ordered' status orders.",
    //   error: error.message,
    // });
  }
};

exports.getShippedStatusOrdersForCustomer = async (req, res) => {
  const { customer_id } = req.params;

  try {
    // Fetch all "shipped" status orders for the given customer
    const orders = await Order.findAll({
      where: { customer_id, order_status: "shipped", delete_status: 0 },
    });

    // Check if no orders are found
    // if (orders.length === 0) {
    //   return res.status(404).json({
    //     message: "No 'shipped' status orders found for the specified customer.",
    //   });
    // }

    RESPONSE.Success.Message =
      "'Shipped' status orders retrieved successfully.";
    RESPONSE.Success.data = orders;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // res.status(200).json({
    //   message: "'Shipped' status orders retrieved successfully.",
    //   data: orders,
    // });
  } catch (error) {
    console.error("getShippedStatusOrdersForCustomer:", error);
    RESPONSE.Failure.Message =
      error.message ||
      "An error occurred while fetching 'shipped' status orders.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res.status(500).json({
    //   message: "An error occurred while fetching 'shipped' status orders.",
    //   error: error.message,
    // });
  }
};

exports.getDeliveredStatusOrdersForCustomer = async (req, res) => {
  const { customer_id } = req.params;

  try {
    // Fetch all "delivered" status orders for the given customer
    const orders = await Order.findAll({
      where: { customer_id, order_status: "delivered", delete_status: 0 },
    });

    // Check if no orders are found
    // if (orders.length === 0) {
    //   return res.status(404).json({
    //     message: "No 'delivered' status orders found for the specified customer.",
    //   });
    // }

    RESPONSE.Success.Message =
      "'Delivered' status orders retrieved successfully.";
    RESPONSE.Success.data = orders;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // res.status(200).json({
    //   message: "'Delivered' status orders retrieved successfully.",
    //   data: orders,
    // });
  } catch (error) {
    console.error("getDeliveredStatusOrdersForCustomer:", error);
    RESPONSE.Failure.Message =
      error.message ||
      "An error occurred while fetching 'delivered' status orders.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res.status(500).json({
    //   message: "An error occurred while fetching 'delivered' status orders.",
    //   error: error.message,
    // });
  }
};

// API to get all "ordered" status orders
exports.getAllOrderedStatusOrders = async (req, res) => {
  try {
    // Fetch all "ordered" status orders
    const orders = await Order.findAll({
      where: { order_status: "ordered", delete_status: 0 },
    });

    RESPONSE.Success.Message =
      "'Ordered' status orders retrieved successfully.";
    RESPONSE.Success.data = orders;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("getOrderedStatusOrders:", error);
    RESPONSE.Failure.Message =
      error.message ||
      "An error occurred while fetching 'ordered' status orders.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// API to get all "shipped" status orders
exports.getAllShippedStatusOrders = async (req, res) => {
  try {
    // Fetch all "shipped" status orders
    const orders = await Order.findAll({
      where: { order_status: "shipped", delete_status: 0 },
    });

    RESPONSE.Success.Message =
      "'Shipped' status orders retrieved successfully.";
    RESPONSE.Success.data = orders;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("getShippedStatusOrders:", error);
    RESPONSE.Failure.Message =
      error.message ||
      "An error occurred while fetching 'shipped' status orders.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// API to get all "delivered" status orders
exports.getAllDeliveredStatusOrders = async (req, res) => {
  try {
    // Fetch all "delivered" status orders
    const orders = await Order.findAll({
      where: { order_status: "delivered", delete_status: 0 },
    });

    RESPONSE.Success.Message =
      "'Delivered' status orders retrieved successfully.";
    RESPONSE.Success.data = orders;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("getDeliveredStatusOrders:", error);
    RESPONSE.Failure.Message =
      error.message ||
      "An error occurred while fetching 'delivered' status orders.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};
