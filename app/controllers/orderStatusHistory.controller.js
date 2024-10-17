const db = require("../models");
const OrderStatusHistory = db.orderStatusHistory;

// Get all Order Status History based on order_id
exports.getAllOrderStatusHistoryByOrderId = async (req, res) => {
  const { order_id } = req.params;

  try {
    // Retrieve all status history entries for the given order_id
    const statusHistory = await OrderStatusHistory.findAll({
      where: { order_id },
      order: [['timestamp', 'DESC']], // Order by timestamp descending
    });

    if (statusHistory.length === 0) {
      return res.status(404).json({
        Status: false,
        Success: false,
        Message: "No status history found for this order.",
      });
    }

    res.status(200).json({
      Status: true,
      Success: true,
      Message: "Order status history retrieved successfully.",
      data: statusHistory,
    });
  } catch (error) {
    res.status(500).json({
      Status: false,
      Success: false,
      Message: "An error occurred while retrieving order status history.",
      Error: error.message,
    });
  }
};
