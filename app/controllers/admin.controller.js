const db = require("../models");
const Admin = db.admins;
const { Op } = require("sequelize"); // Import Op from sequelize
const Order = db.orders; // Reference to the Order model
// const CustomerOperator = db.customerOperator;
const OrderStatusHistory = db.orderStatusHistory;
const Customer = db.customers;
const Operator = db.operators;
const OTP = db.otp;

const RESPONSE = require("../constants/response");
const { MESSAGE } = require("../constants/message");
const { StatusCode } = require("../constants/HttpStatusCode");

exports.checkAdminExistForRegister = async (req, res) => {
  try {
    const { email, phone } = req.body;
    // Check if the email already exists
    const emailExists = await Admin.findOne({
      where: { email, delete_status: 0 },
    });
    if (emailExists) {
      RESPONSE.Success.Message = "Email already exists.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    }

    // Check if the phone number already exists
    const phoneExists = await Admin.findOne({
      where: { phone, delete_status: 0 },
    });
    if (phoneExists) {
      RESPONSE.Success.Message = "Phone number already exists.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    }
    RESPONSE.Success.Message = "Success";
    RESPONSE.Success.data = [];
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("checkAdminExistForRegister:", error);
    RESPONSE.Failure.Message =
      error.message || "Error checkAdminExistForRegister";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// Registration
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // // Check if email or phone number already exists
    // const existingAdmin = await Admin.findOne({
    //   where: {
    //     [Op.or]: [{ email }, { phone }],
    //   },
    // });

    // if (existingAdmin) {
    //   RESPONSE.Success.Message = "Email or phone number already exists.";
    //   RESPONSE.Success.data = {};
    //   return res.status(StatusCode.OK.code).send(RESPONSE.Success);

    //   // return res
    //   //   .status(400)
    //   //   .json({ message: "Email or phone number already exists." });
    // }

    const emailExists = await Admin.findOne({
      where: { email, delete_status: 0 },
    });
    if (emailExists) {
      RESPONSE.Success.Message = "Email already exists.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    }

    // Check if the phone number already exists
    const phoneExists = await Admin.findOne({
      where: { phone, delete_status: 0 },
    });
    if (phoneExists) {
      RESPONSE.Success.Message = "Phone number already exists.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
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
    RESPONSE.Failure.Message = error.message || "Error fetching admin.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // console.error("Error fetching admin by ID:", error);
    // res.status(500).json({ message: "Error fetching admin." });
  }
};

// Soft delete admin by setting delete_status to 1 and updating deletedAt
exports.deleteAdmin = async (req, res) => {
  try {
    const adminId = req.params.admin_id; // Get admin_id from request parameters

    // Find the admin by ID
    const admin = await Admin.findOne({ where: { admin_id: adminId } });

    if (!admin) {
      RESPONSE.Failure.Message = "Admin not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    // Check if the admin is already soft deleted
    if (admin.delete_status === 1) {
      RESPONSE.Failure.Message = "Admin is already deleted.";
      return res.status(StatusCode.OK.code).send(RESPONSE.Failure);
    }

    // Perform soft delete by updating the delete_status and deletedAt fields
    await Admin.update(
      {
        delete_status: 1,
        deletedAt: new Date(), // Set current timestamp as the deleted time
      },
      { where: { admin_id: adminId } }
    );

    RESPONSE.Success.Message = "Admin soft deleted successfully.";
    RESPONSE.Success.data = {};
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("Error in deleting admin:", error);
    RESPONSE.Failure.Message = error.message || "Failed to delete admin.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

exports.getOverallDashboardStats = async (req, res) => {
  try {
    // Fetch total order count, total volume, and total amountOfProduct from the Orders table
    const orderStats = await Order.findAll({
      where: { delete_status: 0 },
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

    // Count each status from the OrderStatusHistory table where active_status is true
    const statusCounts = await OrderStatusHistory.findAll({
      where: { active_status: true, delete_status: 0 },
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
      where: { delete_status: 0 },
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
      where: { delete_status: 0 },
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

// Edit admin information after verifying OTP
exports.editAdminInfo = async (req, res) => {
  try {
    const adminId = req.params.admin_id; // Get admin_id from request parameters
    const {
      email,
      otp,
      newName,
      newPhone,
      newEmail,
      newPassword,
      newProfileImage,
    } = req.body;

    // First, check if the new email already exists
    if (newEmail && newEmail !== email) {
      const emailExists = await Admin.findOne({
        where: {
          email: newEmail,
          admin_id: { [Op.ne]: adminId }, // Exclude current admin by ID
          delete_status: 0,
        },
      });

      if (emailExists) {
        RESPONSE.Success.Message =
          "The new email is already in use by another admin.";
        RESPONSE.Success.data = {};
        return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      }
    }

    // Next, check if the new phone number already exists
    if (newPhone) {
      const phoneExists = await Admin.findOne({
        where: {
          phone: newPhone,
          admin_id: { [Op.ne]: adminId }, // Exclude current admin by ID
          delete_status: 0,
        },
      });

      if (phoneExists) {
        RESPONSE.Success.Message =
          "The new phone number is already in use by another admin.";
        RESPONSE.Success.data = {};
        return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      }
    }

    // Verify OTP
    const otpData = await OTP.findOne({ where: { email, otp } });

    if (!otpData) {
      RESPONSE.Success.Message = MESSAGE.INVALID_OTP;
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    }

    // Check if the OTP is expired
    if (otpData.expiresAt < Date.now()) {
      await OTP.destroy({ where: { email, otp } }); // Remove expired OTP
      RESPONSE.Success.Message = MESSAGE.OTP_EXPIRED;
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    }

    // Find the admin by ID
    const admin = await Admin.findOne({
      where: { admin_id: adminId },
    });

    if (!admin) {
      RESPONSE.Failure.Message = "Admin not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    // Prepare the fields to update
    const updatedFields = {
      name: newName || admin.name,
      phone: newPhone || admin.phone,
      email: newEmail || admin.email,
      password: newPassword || admin.password,
      profileImage: newProfileImage || admin.profileImage,
    };

    // Update admin using Admin.update()
    await Admin.update(updatedFields, {
      where: { admin_id: adminId },
    });

    // Fetch the updated admin details
    const updatedAdmin = await Admin.findOne({
      where: { admin_id: adminId },
      attributes: { exclude: ["password"] },
    });

    // Delete OTP after successful verification
    await OTP.destroy({ where: { email, otp } });

    RESPONSE.Success.Message = "Admin information updated successfully.";
    RESPONSE.Success.data = updatedAdmin;
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("Error updating admin information:", error);
    RESPONSE.Failure.Message =
      error.message || "Failed to update admin information.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};
