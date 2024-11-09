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
const dateFilterController = require("../controllers/dateFilter.controller.js");
const router = require("express").Router();
const isAuthenticated = require("../middleware/auth_middleware.js");
const otpController = require("../controllers/otp.controller.js");
const AddressesController = require("../controllers/address.controller.js");

// uploads

router.post("/uploadImage", imageController.uploadImage);
// router.post("/uploadVideo", videoController.uploadVideo);
// router.post("/uploadAudio", audioController.uploadAudio);

// admin Routes

router.post("/register/admin", adminController.registerAdmin);
router.post("/login/admin", adminController.loginAdmin);
router.get("/getAdminById/:admin_id", adminController.getAdminById);

router.get(
  "/getOverallDashboardStats",
  adminController.getOverallDashboardStats
);
router.delete("/deleteAdmin/:admin_id", adminController.deleteAdmin);

router.put("/editAdminInfo/:admin_id", adminController.editAdminInfo);

router.post("/resetPasswordForAdmin", adminController.resetPasswordForAdmin);

router.post(
  "/checkEmailPhoneAvailabilityForAdmin/:admin_id",
  adminController.checkEmailPhoneAvailabilityForAdmin
);

// manager Routes
router.post("/register/manager", managerController.registerManager);
router.post("/login/manager", managerController.loginManager);
router.get("/getManagerById/:manager_id", managerController.getManagerById);
router.delete("/deleteManager/:manager_id", managerController.deleteManager);
router.put("/editManagerInfo/:manager_id", managerController.editManagerInfo);

router.post(
  "/resetPasswordForManager",
  managerController.resetPasswordForManager
);

router.post(
  "/checkEmailPhoneAvailabilityForManager/:manager_id",
  managerController.checkEmailPhoneAvailabilityForManager
);

// operator Routes
router.post("/register/operator", operatorController.registerOperator);
router.post(
  "/register/checkOperatorExistForRegister",
  operatorController.checkOperatorExistForRegister
);
router.post("/login/operator", operatorController.loginOperator);
router.post(
  "/updateApprovelForOperator",
  operatorController.updateApprovelForOperator
);
// this api for showing all opreator and ApprovalStatus for table
router.get("/getAllOperators", operatorController.getAllOperators);
// this api for dowpdon like quizz grand and revol access so we do Approval or reject
router.get(
  "/getAllOperatorsWithApprovalStatus",
  operatorController.getAllOperatorsWithApprovalStatus
);
// this api for dropdown that give customer assign that time we have to show only Approved operator
router.get("/getApprovedOperators", operatorController.getApprovedOperators);
router.get("/getPendingOperators", operatorController.getPendingOperators);
router.get("/getOperatorById/:operator_id", operatorController.getOperatorById);
router.get(
  "/getAllOperatorsWithCustomerDetails",
  operatorController.getAllOperatorsWithCustomerDetails
);
router.put(
  "/editOperatorInfo/:operator_id",
  operatorController.editOperatorInfo
);

router.post(
  "/checkEmailPhoneAvailabilityForOperator/:operator_id",
  operatorController.checkEmailPhoneAvailabilityForOperator
);

router.post(
  "/resetPasswordForOperator",
  operatorController.resetPasswordForOperator
);
router.delete(
  "/deleteOperator/:operator_id",
  operatorController.deleteOperator
);

// customer Routes
router.post("/register/customer", customerController.registerCustomer);

router.post(
  "/register/checkCustomerExistForRegister",
  customerController.checkCustomerExistForRegister
);
router.post("/login/customer", customerController.loginCustomer);
router.get(
  "/getAllCustomersWithOperatorsDetails",
  customerController.getAllCustomersWithOperatorsDetails
);
router.get(
  "/getCustomersWithoutOperators",
  customerController.getCustomersWithoutOperators
);
router.get("/getAllCustomers", customerController.getAllCustomers);
router.get("/getCustomerById/:customer_id", customerController.getCustomerById);
router.get("/getCustomerById/:customer_id", customerController.getCustomerById);
router.put(
  "/editCustomerInfo/:customer_id",
  customerController.editCustomerInfo
);
router.delete(
  "/deleteCustomer/:customer_id",
  customerController.deleteCustomer
);
router.post(
  "/resetPasswordForCustomer",
  customerController.resetPasswordForCustomer
);

router.post(
  "/checkEmailPhoneAvailabilityForCustomer/:customer_id",
  customerController.checkEmailPhoneAvailabilityForCustomer
);

// order Routes

router.post("/createOrder", orderController.createOrder);
router.delete("/deleteOrder/:order_id", orderController.deleteOrder);
router.get("/getAllOrders", orderController.getAllOrders);
router.get("/getOrderById/:order_id", orderController.getOrderById);
router.put("/updateOrder/:order_id", orderController.updateOrder);

router.put(
  "/updateOrderPaymentProofImages/:order_id",
  orderController.updateOrderPaymentProofImages
);
router.put(
  "/updateOrderToOperator/:order_id",
  orderController.updateOrderToOperator
);
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

router.get(
  "/getAllOrderedStatusOrders",
  orderController.getAllOrderedStatusOrders
);

router.get(
  "/getAllShippedStatusOrders",
  orderController.getAllShippedStatusOrders
);

router.get(
  "/getAllDeliveredStatusOrders",
  orderController.getAllDeliveredStatusOrders
);

router.get(
  "/getAllOrdersWithCustomerAndOperatorDetails",
  orderController.getAllOrdersWithCustomerAndOperatorDetails
);

router.get(
  "/getAllOrderedStatusOrdersWithCustomerAndOperatorDetails",
  orderController.getAllOrderedStatusOrdersWithCustomerAndOperatorDetails
);

router.get(
  "/getAllShippedStatusOrdersWithCustomerAndOperatorDetails",
  orderController.getAllShippedStatusOrdersWithCustomerAndOperatorDetails
);

router.get(
  "/getAllDeliveredStatusOrdersWithCustomerAndOperatorDetails",
  orderController.getAllDeliveredStatusOrdersWithCustomerAndOperatorDetails
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

router.get(
  "/getCustomersByOperator/operator/:operator_id",
  customerOperatorController.getCustomersByOperator
);

// data filder routes

// admin ===========>

router.post(
  "/getOverallDashboardStatsWithFilter",
  dateFilterController.getOverallDashboardStatsWithFilter
);
router.post(
  "/getAllOrdersWithCustomerAndOperatorDetailsWithFilter",
  dateFilterController.getAllOrdersWithCustomerAndOperatorDetailsWithFilter
);
router.post(
  "/getAllOrdersWithFilter",
  dateFilterController.getAllOrdersWithFilter
);
router.post(
  "/getAllOperatorsWithCustomerDetailWithFilter",
  dateFilterController.getAllOperatorsWithCustomerDetailWithFilter
);
router.post(
  "/getAllOperatorsWithFilter",
  dateFilterController.getAllOperatorsWithFilter
);
router.post(
  "/getAllCustomersWithOperatorsDetailsWithFilter",
  dateFilterController.getAllCustomersWithOperatorsDetailsWithFilter
);
router.post(
  "/getAllCustomersWithFilter",
  dateFilterController.getAllCustomersWithFilter
);

router.post(
  "/getAllOrderedStatusOrdersByOrdersTimeWithFilter",
  dateFilterController.getAllOrderedStatusOrdersByOrdersTimeWithFilter
);
router.post(
  "/getAllShippedStatusOrdersByOrdersTimeWithFilter",
  dateFilterController.getAllShippedStatusOrdersByOrdersTimeWithFilter
);
router.post(
  "/getAllDeliveredStatusOrdersByOrdersTimeWithFilter",
  dateFilterController.getAllDeliveredStatusOrdersByOrdersTimeWithFilter
);

router.post(
  "/getAllOrderedStatusOrdersWithFilter",
  dateFilterController.getAllOrderedStatusOrdersWithFilter
);
router.post(
  "/getAllShippedStatusOrdersWithFilter",
  dateFilterController.getAllShippedStatusOrdersWithFilter
);
router.post(
  "/getAllDeliveredStatusOrdersWithFilter",
  dateFilterController.getAllDeliveredStatusOrdersWithFilter
);

// customer ===========>

router.post(
  "/getDashboardStatsForCustomerWithFilter/customer/:customer_id",
  dateFilterController.getDashboardStatsForCustomerWithFilter
);

router.post(
  "/getAllOrdersByCustomerWithFilter/customer/:customer_id",
  dateFilterController.getAllOrdersByCustomerWithFilter
);

router.post(
  "/getOrderedStatusOrdersForCustomerOrdersTimeWithFilter/customer/:customer_id",
  dateFilterController.getOrderedStatusOrdersForCustomerOrdersTimeWithFilter
);

router.post(
  "/getShippedStatusOrdersForCustomerOrdersTimeWithFilter/customer/:customer_id",
  dateFilterController.getShippedStatusOrdersForCustomerOrdersTimeWithFilter
);

router.post(
  "/getDeliveredStatusOrdersForCustomerOrdersTimeWithFilter/customer/:customer_id",
  dateFilterController.getDeliveredStatusOrdersForCustomerOrdersTimeWithFilter
);

// operator  ===========>

router.post(
  "/getDashboardStatsForOperatorWithFilter/operator/:operator_id",
  dateFilterController.getDashboardStatsForOperatorWithFilter
);

router.post(
  "/getAllOrdersByOperatorWithFilter/operator/:operator_id",
  dateFilterController.getAllOrdersByOperatorWithFilter
);

// issue is their if admin update the operator to that customer after some
//  month , if we filter and  giving brfore update time that customer is
//  not showing for operator because we directly update

// ----
// to solve this when update we have to insret new row and when map the
// operaor to customer we have to consider last row for map customer

// -------------------- NOT SOLVED (25-10-24) -------------------

router.post(
  "/getCustomersForOperatorWithFilter/operator/:operator_id",
  dateFilterController.getCustomersForOperatorWithFilter
);

router.post(
  "/getOrderedStatusOrdersForOperatorOrdersTimeWithFilter/operator/:operator_id",
  dateFilterController.getOrderedStatusOrdersForOperatorOrdersTimeWithFilter
);

router.post(
  "/getShippedStatusOrdersForOperatorOrdersTimeWithFilter/operator/:operator_id",
  dateFilterController.getShippedStatusOrdersForOperatorOrdersTimeWithFilter
);

router.post(
  "/getDeliveredStatusOrdersForOperatorOrdersTimeWithFilter/operator/:operator_id",
  dateFilterController.getDeliveredStatusOrdersForOperatorOrdersTimeWithFilter
);

// Routes for OTP
router.post("/sendOTP", otpController.sendOTP);
router.post("/verifyOTP", otpController.verifyOTP);


// Addresses router

router.post("/createAddress", AddressesController.createAddress);
router.get("/getAllAddresses", AddressesController.getAllAddresses);
router.get("/getAddressById/:address_id", AddressesController.getAddressById);
router.put("/updateAddress/:address_id", AddressesController.updateAddress);
router.delete("/deleteAddress/:address_id", AddressesController.deleteAddress);
router.get(
  "/getAllAddressesDropdown",
  AddressesController.getAllAddressesDropdown
);

module.exports = router;
