const db = require("../models");
const OrderStatusHistory = db.orderStatusHistory;

const RESPONSE = require("../constants/response");
const { MESSAGE } = require("../constants/message");
const { StatusCode } = require("../constants/HttpStatusCode");

// Get all Order Status History based on order_id
exports.getAllOrderStatusHistoryByOrderId = async (req, res) => {
  const { order_id } = req.params;

  try {
    // Retrieve all status history entries for the given order_id
    const statusHistory = await OrderStatusHistory.findAll({
      where: { order_id },
      order: [["timestamp", "DESC"]], // Order by timestamp descending
    });

    if (statusHistory.length === 0) {
      RESPONSE.Failure.Message = "No status history found for this order.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
      // return res.status(404).json({
      //   Status: false,
      //   Success: false,
      //   Message: "No status history found for this order.",
      // });
    }
    RESPONSE.Success.Message = "Order status history retrieved successfully.";
    RESPONSE.Success.data = statusHistory;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // res.status(200).json({
    //   Status: true,
    //   Success: true,
    //   Message: "Order status history retrieved successfully.",
    //   data: statusHistory,
    // });
  } catch (error) {
    console.error("getAllOrderStatusHistoryByOrderId:", error);
    RESPONSE.Failure.Message =
      error.message ||
      "An error occurred while retrieving order status history.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res.status(500).json({
    //   Status: false,
    //   Success: false,
    //   Message: "An error occurred while retrieving order status history.",
    //   Error: error.message,
    // });
  }
};
