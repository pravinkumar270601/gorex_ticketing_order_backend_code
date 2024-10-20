const imageController = require("../controllers/upload_image.controller.js");
const videoController = require("../controllers/upload_video.controller.js");
const audioController = require("../controllers/upload_audio.controller.js");
const adminController = require("../controllers/admin.controller.js");
const managerController = require("../controllers/manager.controller.js");
const operatorController = require("../controllers/operator.controller.js");
const customerController = require("../controllers/customer.controller.js");
const orderController = require("../controllers/order.controller.js");
const customerOperatorController = require("../controllers/customerOperator.controller.js");
const orderStatusHistoryController = require("../controllers/orderStatusHistory.controller.js");
const router = require("express").Router();
const isAuthenticated = require("../middleware/auth_middleware.js");

// uploads

router.post("/uploadImage", imageController.uploadImage);
// router.post("/uploadVideo", videoController.uploadVideo);
// router.post("/uploadAudio", audioController.uploadAudio);

// admin Routes

router.post("/register/admin", adminController.registerAdmin);
router.post("/login/admin", adminController.loginAdmin);
router.get("/getAdminById/:admin_id", adminController.getAdminById);


// manager Routes
router.post("/register/manager", managerController.registerManager);
router.post("/login/manager", managerController.loginManager);
router.get("/getManagerById/:manager_id", managerController.getManagerById);


// operator Routes
router.post("/register/operator", operatorController.registerOperator);
router.post("/login/operator", operatorController.loginOperator);
router.post("/updateApprovelForOperator", operatorController.updateApprovelForOperator);
// this api for showing all opreator and ApprovalStatus for table
router.get("/getAllOperators", operatorController.getAllOperators);
// this api for dowpdon like quizz grand and revol access so we do Approval or reject 
router.get("/getAllOperatorsWithApprovalStatus", operatorController.getAllOperatorsWithApprovalStatus);
// this api for dropdown that give customer assign that time we have to show only Approved operator
router.get("/getApprovedOperators", operatorController.getApprovedOperators);

router.get("/getOperatorById/:operator_id", operatorController.getOperatorById);



// customer Routes
router.post("/register/customer", customerController.registerCustomer);
router.post("/login/customer", customerController.loginCustomer);
router.get("/getAllCustomersWithOperatorsDetails", customerController.getAllCustomersWithOperatorsDetails);
router.get("/getCustomersWithoutOperators", customerController.getCustomersWithoutOperators);
router.get("/getAllCustomers", customerController.getAllCustomers);
router.get("/getCustomerById/:customer_id", customerController.getCustomerById);



// order Routes

router.post("/createOrder", orderController.createOrder);
router.delete("/deleteOrder/:order_id", orderController.deleteOrder);
router.get("/getAllOrders", orderController.getAllOrders);
router.get("/getOrderById/:order_id", orderController.getOrderById);
router.put("/updateOrder/:order_id", orderController.updateOrder);
router.put("/updateOrderToOperator/:order_id", orderController.updateOrderToOperator);
router.get(
  "/getAllOrdersForOperator/operator/:operator_id",
  orderController.getAllOrdersForOperator
);
router.get(
  "/getAllOrdersByCustomer/customer/:customer_id",
  orderController.getAllOrdersByCustomer
);
router.put(
  "/updateOrderStatusWithTime/:order_id",
  orderController.updateOrderStatusWithTime
);
router.get(
  "/getAllOrderStatusHistoryByOrderId/:order_id",
  orderStatusHistoryController.getAllOrderStatusHistoryByOrderId
);


router.get(
  "/getDashboardStatsForCustomer/customer/:customer_id",
  orderController.getDashboardStatsForCustomer
);


router.get(
  "/getDashboardStatsForOperator/operator/:operator_id",
  orderController.getDashboardStatsForOperator
);


router.get(
  "/getOrderedStatusOrdersForOperator/operator/:operator_id",
  orderController.getOrderedStatusOrdersForOperator
);

router.get(
  "/getShippedStatusOrdersForOperator/operator/:operator_id",
  orderController.getShippedStatusOrdersForOperator
);

router.get(
  "/getDeliveredStatusOrdersForOperator/operator/:operator_id",
  orderController.getDeliveredStatusOrdersForOperator
);

router.get(
  "/getOrderedStatusOrdersForCustomer/customer/:customer_id",
  orderController.getOrderedStatusOrdersForCustomer
);

router.get(
  "/getShippedStatusOrdersForCustomer/customer/:customer_id",
  orderController.getShippedStatusOrdersForCustomer
);

router.get(
  "/getDeliveredStatusOrdersForCustomer/customer/:customer_id",
  orderController.getDeliveredStatusOrdersForCustomer
);





// customerOperator Routes

router.post("/createAssignment", customerOperatorController.createAssignment);
router.post(
  "/createMultipleAssignments",
  customerOperatorController.createMultipleAssignments
);
router.get("/getAllAssignments", customerOperatorController.getAllAssignments);
router.put(
  "/updateAssignment/:assignment_id",
  customerOperatorController.updateAssignment
);
router.delete(
  "/deleteAssignment/:assignment_id",
  customerOperatorController.deleteAssignment
);
router.put(
  "/updateOperatorAssignment",
  customerOperatorController.updateOperatorAssignment
);

router.get("/getCustomersByOperator/operator/:operator_id", customerOperatorController.getCustomersByOperator);


module.exports = router;
