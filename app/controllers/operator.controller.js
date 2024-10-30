const db = require("../models");
const Operator = db.operators;
const { Op } = require("sequelize"); // Import Op from sequelize
const OTP = db.otp;
const RESPONSE = require("../constants/response");
const { MESSAGE } = require("../constants/message");
const { StatusCode } = require("../constants/HttpStatusCode");
const CustomerOperator = db.customerOperator;
const Customer = db.customers;

exports.checkOperatorExistForRegister = async (req, res) => {
  try {
    const {email, phone } = req.body;
    // Check if the email already exists
    const emailExists = await Operator.findOne({ where: { email } });
    if (emailExists) {
      RESPONSE.Success.Message = "Email already exists.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    }

    // Check if the phone number already exists
    const phoneExists = await Operator.findOne({ where: { phone } });
    if (phoneExists) {
      RESPONSE.Success.Message = "Phone number already exists.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    }
    RESPONSE.Success.Message = "Success";
    RESPONSE.Success.data = [];
    res.status(StatusCode.OK.code).send(RESPONSE.Success);

  } catch (error) {
    console.error("checkOperatorExistForregister:", error);
    RESPONSE.Failure.Message = error.message || "Error checkOperatorExistForregister manager";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    
  }
};

// Registration
// exports.registerOperator = async (req, res) => {
//   try {
//     const { name, email, phone, password, profileImage } = req.body;

//     // Check if email or phone number already exists
//     // const existingOperator = await Operator.findOne({
//     //   where: {
//     //     [Op.or]: [{ email }, { phone }],
//     //   },
//     // });

//     // if (existingOperator) {
//     //   RESPONSE.Success.Message = "Email or phone number already exists.";
//     //   RESPONSE.Success.data = {};
//     //   return res.status(StatusCode.OK.code).send(RESPONSE.Success);
//     //   // return res
//     //   //   .status(400)
//     //   //   .json({ message: "Email or phone number already exists." });
//     // }

//     // Check if email or phone number already exists
//     // const existingOperator = await Operator.findOne({
//     //   where: {
//     //     [Op.or]: [{ email }, { phone }],
//     //   },
//     // });

//     // if (existingOperator) {
//     //   RESPONSE.Success.Message = "Email or phone number already exists.";
//     //   RESPONSE.Success.data = {};
//     //   return res.status(StatusCode.OK.code).send(RESPONSE.Success);
//     // }

//     // Check if the email already exists
//     const emailExists = await Operator.findOne({ where: { email } });
//     if (emailExists) {
//       RESPONSE.Success.Message = "Email already exists.";
//       RESPONSE.Success.data = {};
//       return res.status(StatusCode.OK.code).send(RESPONSE.Success);
//     }

//     // Check if the phone number already exists
//     const phoneExists = await Operator.findOne({ where: { phone } });
//     if (phoneExists) {
//       RESPONSE.Success.Message = "Phone number already exists.";
//       RESPONSE.Success.data = {};
//       return res.status(StatusCode.OK.code).send(RESPONSE.Success);
//     }

//     const operator = await Operator.create({
//       name,
//       email,
//       phone,
//       password,
//       profileImage,
//       approval_status: "pending",
//     });
//     RESPONSE.Success.Message =
//       "Operator registration successful. Waiting for admin approval.";
//     RESPONSE.Success.data = operator;
//     res.status(StatusCode.CREATED.code).send(RESPONSE.Success);
//     // res
//     //   .status(201)
//     //   .json({ message: "Operator registered successfully", operator });
//   } catch (error) {
//     console.error("registerOperator:", error);
//     RESPONSE.Failure.Message = error.message || "Error registering manager";
//     res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
//     // res
//     //   .status(500)
//     //   .json({ message: "Error registering operator", error: error.message });
//   }
// };

// Registration with otp
exports.registerOperator = async (req, res) => {
  try {
    const { name, email, phone, password, profileImage, otp } = req.body;

    // Check if email or phone number already exists
    // const existingOperator = await Operator.findOne({
    //   where: {
    //     [Op.or]: [{ email }, { phone }],
    //   },
    // });

    // if (existingOperator) {
    //   RESPONSE.Success.Message = "Email or phone number already exists.";
    //   RESPONSE.Success.data = {};
    //   return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // }

    // Check if the email already exists
    const emailExists = await Operator.findOne({ where: { email } });
    if (emailExists) {
      RESPONSE.Success.Message = "Email already exists.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    }

    // Check if the phone number already exists
    const phoneExists = await Operator.findOne({ where: { phone } });
    if (phoneExists) {
      RESPONSE.Success.Message = "Phone number already exists.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
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

    // Create the operator if OTP is valid
    const operator = await Operator.create({
      name,
      email,
      phone,
      password,
      profileImage,
      approval_status: "pending",
    });

    // Delete OTP after successful verification
    await OTP.destroy({ where: { email, otp } });

    RESPONSE.Success.Message =
      "Operator registration successful. Waiting for admin approval.";
    RESPONSE.Success.data = operator;
    res.status(StatusCode.CREATED.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("registerOperator:", error);
    RESPONSE.Failure.Message = error.message || "Error registering operator";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// Edit operator information after verifying OTP
exports.editOperatorInfo = async (req, res) => {
  try {
    const operatorId = req.params.operator_id; // Get operator_id from URL params
    const {
      email,
      otp,
      newName,
      newPhone,
      newEmail,
      newPassword,
      newProfileImage,
    } = req.body;

    // Check if the new email already exists, excluding the current operator
    if (newEmail && newEmail !== email) {
      const emailExists = await Operator.findOne({
        where: {
          email: newEmail,
          operator_id: { [Op.ne]: operatorId }, // Exclude current operator
        },
      });

      if (emailExists) {
        RESPONSE.Failure.Message =
          "The new email is already in use by another operator.";
        return res.status(StatusCode.CONFLICT.code).send(RESPONSE.Failure);
      }
    }

    // Next, check if the new phone number already exists
    if (newPhone) {
      const phoneExists = await Operator.findOne({
        where: {
          phone: newPhone,
          customer_id: { [Op.ne]: operatorId }, // Exclude current customer by ID
        },
      });

      if (phoneExists) {
        RESPONSE.Success.Message =
          "The new phone number is already in use by another customer.";
        RESPONSE.Success.data = {};
        return res.status(StatusCode.OK.code).send(RESPONSE.Success);
        // RESPONSE.Failure.Message = "The new phone number is already in use by another customer.";
        // return res.status(StatusCode.CONFLICT?.code || 409).send(RESPONSE.Failure);
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

    // Fetch the current operator details
    const operator = await Operator.findOne({
      where: { operator_id: operatorId },
    });

    if (!operator) {
      RESPONSE.Failure.Message = "Operator not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    // Prepare the fields to update
    const updatedFields = {
      name: newName || operator.name,
      phone: newPhone || operator.phone,
      email: newEmail || operator.email,
      password: newPassword || operator.password,
      profileImage: newProfileImage || operator.profileImage,
    };

    // Update operator using Operator.update()
    await Operator.update(updatedFields, {
      where: { operator_id: operatorId },
    });

    // Fetch the updated operator details
    const updatedOperator = await Operator.findOne({
      where: { operator_id: operatorId },
      attributes: { exclude: ["password"] },
    });

    // Delete OTP after successful verification
    await OTP.destroy({ where: { email, otp } });

    RESPONSE.Success.Message = "Operator information updated successfully.";
    RESPONSE.Success.data = updatedOperator;
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("Error updating operator information:", error);
    RESPONSE.Failure.Message =
      error.message || "Failed to update operator information.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// Get operator details by operator_id
exports.getOperatorById = async (req, res) => {
  const operatorId = req.params.operator_id; // Get operator_id from request parameters

  try {
    const operator = await Operator.findOne({
      where: { operator_id: operatorId },
      attributes: { exclude: ["password"] }, // Exclude the password field from the response
    });

    if (!operator) {
      RESPONSE.Failure.Message = "Operator not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
      // return res.status(404).json({ message: "Operator not found." });
    }

    RESPONSE.Success.Message = "getOperatorById successfully.";
    RESPONSE.Success.data = operator;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // res.status(200).json(operator);
  } catch (error) {
    console.error("Error fetching operator by ID:", error);

    RESPONSE.Failure.Message = error.message || "Error fetching operator.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res.status(500).json({ message: "Error fetching operator." });
  }
};

// Login
// exports.loginOperator = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const operator = await Operator.findOne({ where: { email, password } });
//     if (!operator) {
//       RESPONSE.Success.Message = "Operator not found!";
//       RESPONSE.Success.data = {};
//       return res.status(StatusCode.OK.code).send(RESPONSE.Success);
//       // return res.status(401).json({ message: "Invalid credentials" });
//     }
//     RESPONSE.Success.Message = "Operator logged in successfully";
//     RESPONSE.Success.data = operator;
//     res.status(StatusCode.CREATED.code).send(RESPONSE.Success);
//     // res
//     //   .status(200)
//     //   .json({ message: "Operator logged in successfully", operator });
//   } catch (error) {
//     console.error("loginManager:", error);
//     RESPONSE.Failure.Message = error.message || "Error logging in manager.";
//     res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
//     // res
//     //   .status(500)
//     //   .json({ message: "Error logging in operator", error: error.message });
//   }
// };

// Operator Login
exports.loginOperator = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the operator by email
    const operator = await Operator.findOne({ where: { email } });
    if (!operator) {
      RESPONSE.Success.Message = "Operator not found.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      // return res.status(404).json({ message: "Operator not found." });
    }

    // Check if the operator's approval status is pending
    if (operator.approval_status === "pending") {
      RESPONSE.Success.Message =
        "Your registration is pending approval. Please wait for admin approval.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      // return res.status(403).json({
      //   message: "Your registration is pending approval. Please wait for admin approval.",
      // });
    }

    // Check if the approval status is rejected
    if (operator.approval_status === "rejected") {
      RESPONSE.Success.Message =
        "Your registration request was rejected. Please contact admin.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      // return res.status(403).json({
      //   message: "Your registration request was rejected. Please contact admin.",
      // });
    }

    // Verify password (for simplicity, directly comparing the plain text password)
    if (operator.password !== password) {
      RESPONSE.Success.Message = "Invalid password.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      // return res.status(401).json({ message: "Invalid password." });
    }

    // If approved, allow login
    RESPONSE.Success.Message =
      "Your request has been approved, Login successful.";
    RESPONSE.Success.data = {
      operator_id: operator.operator_id,
      name: operator.name,
      email: operator.email,
      phone: operator.phone,
      profileImage: operator.profileImage,
    };
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // res.status(200).json({
    //   message: "Login successful.",
    //   operator: {
    //     operator_id: operator.operator_id,
    //     name: operator.name,
    //     email: operator.email,
    //     phone: operator.phone,
    //     profileImage: operator.profileImage,
    //   },
    // });
  } catch (error) {
    console.error("loginOperator:", error);
    RESPONSE.Failure.Message = error.message || "Error during login.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // console.error("loginOperator:", error);
    // res.status(500).json({ message: "Error during login." });
  }
};

// Admin Approval for Operator
exports.updateApprovelForOperator = async (req, res) => {
  try {
    const { operator_id, approval_status } = req.body;

    // Validate the approval status
    if (!["approved", "rejected"].includes(approval_status)) {
      RESPONSE.Failure.Message = "Invalid approval status.";
      return res.status(StatusCode.BAD_REQUEST.code).send(RESPONSE.Failure);
      // return res.status(400).json({ message: "Invalid approval status." });
    }

    // Find and update the operator's approval status
    const [updated] = await Operator.update(
      { approval_status },
      { where: { operator_id } }
    );

    // Check if the update was successful
    if (updated === 0) {
      // Check if the operator exists but the approval status is already the same
      const existingOperator = await Operator.findOne({
        where: { operator_id },
      });

      if (
        existingOperator &&
        existingOperator.approval_status === approval_status
      ) {
        // If the approval status is already up to date
        RESPONSE.Success.Message =
          "No changes detected. The operator approval status is already up to date.";
        RESPONSE.Success.data = updatedOperator;
        return res.status(StatusCode.OK.code).send(RESPONSE.Success);
        // return res.status(200).json({
        //   message:
        //     "No changes detected. The operator approval status is already up to date.",
        //   operator: existingOperator,
        // });
      } else {
        // If the operator is not found or has already been deleted
        RESPONSE.Failure.Message = "Operator not found or already deleted.";
        return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
        // return res.status(404).json({
        //   message: "Operator not found or already deleted.",
        // });
      }
    }

    // Find the operator by ID
    const updatedOperator = await Operator.findByPk(operator_id);
    // if (!operator) {
    //   RESPONSE.Failure.Message = "Operator not found.";
    //   return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    //   // return res.status(404).json({ message: "Operator not found." });
    // }

    RESPONSE.Success.Message = `Operator has been ${approval_status}.`;
    RESPONSE.Success.data = updatedOperator;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);

    // res.status(200).json({
    //   message: `Operator has been ${approval_status}.`,
    //   operator: updatedOperator,
    // });
  } catch (error) {
    console.error("approveOperator:", error);
    RESPONSE.Failure.Message = error.message || "Error approving operator.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // console.error("approveOperator:", error);
    // res.status(500).json({ message: "Error approving operator." });
  }
};

// Get all operators by approval status
// getOperatorsByStatus
exports.getApprovedOperators = async (req, res) => {
  try {
    // const { status } = req.query; // Query parameter for approval status (pending, approved, or rejected)

    // Fetch operators based on the provided status
    const operators = await Operator.findAll({
      // where: { approval_status: status }

      where: { approval_status: "approved" },
    });

    if (operators.length === 0) {
      RESPONSE.Success.Message =
        "No operators found with the specified status.";
      RESPONSE.Success.data = [];
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      // return res
      //   .status(404)
      //   .json({ message: "No operators found with the specified status." });
    }

    RESPONSE.Success.Message = "getApprovedOperators succesfully";
    RESPONSE.Success.data = operators;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // res.status(200).json({ operators });
  } catch (error) {
    console.error("getOperatorsByStatus:", error);
    RESPONSE.Failure.Message = error.message || "Error approving operator.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // console.error("getOperatorsByStatus:", error);
    // res.status(500).json({ message: "Error fetching operators by status." });
  }
};

exports.getPendingOperators = async (req, res) => {
  try {
    // const { status } = req.query; // Query parameter for approval status (pending, approved, or rejected)

    // Fetch operators based on the provided status
    const operators = await Operator.findAll({
      // where: { approval_status: status }

      where: { approval_status: "pending" },
    });

    if (operators.length === 0) {
      RESPONSE.Success.Message =
        "No operators found with the specified status.";
      RESPONSE.Success.data = [];
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      // return res
      //   .status(404)
      //   .json({ message: "No operators found with the specified status." });
    }

    RESPONSE.Success.Message = "getPendingOperators succesfully";
    RESPONSE.Success.data = operators;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // res.status(200).json({ operators });
  } catch (error) {
    console.error("getPendingOperators:", error);
    RESPONSE.Failure.Message =
      error.message || "Error fetching operators by status.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // console.error("getOperatorsByStatus:", error);
    // res.status(500).json({ message: "Error fetching operators by status." });
  }
};

// Get all operators with their approval status and current status as boolean
exports.getAllOperatorsWithApprovalStatus = async (req, res) => {
  try {
    // Fetch all operators
    const operators = await Operator.findAll();

    // Map operators to include approval status as string and current_status as boolean
    const operatorsWithStatus = operators.map((operator) => ({
      operator_id: operator.operator_id,
      name: operator.name,
      email: operator.email,
      phone: operator.phone,
      approval_status: operator.approval_status, // "approved", "pending", or "rejected"
      current_status: operator.approval_status === "approved", // true if approved, false otherwise
    }));
    RESPONSE.Success.Message =
      "getAllOperatorsWithApprovalStatus successfully.";
    RESPONSE.Success.data = operatorsWithStatus;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // res.status(200).json({ operators: operatorsWithStatus });
  } catch (error) {
    console.error("getAllOperatorsWithApprovalStatus:", error);
    RESPONSE.Failure.Message = error.message || "Error fetching operators.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // console.error("getAllOperatorsWithApprovalStatus:", error);
    // res.status(500).json({ message: "Error fetching operators." });
  }
};

// Get all operators
exports.getAllOperators = async (req, res) => {
  try {
    // Fetch all operators
    const operators = await Operator.findAll();
    // or
    // const operators = await Operator.findAll({
    //   attributes: { exclude: ['password'] }, // Exclude the password field
    // });

    // Check if operators exist
    if (operators.length === 0) {
      RESPONSE.Success.Message = "No operators found.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      // return res.status(404).json({ message: "No operators found." });
    }

    // Format the response
    const operatorsResponse = operators.map((operator) => ({
      operator_id: operator.operator_id,
      name: operator.name,
      email: operator.email,
      phone: operator.phone,
      profileImage: operator.profileImage,
      approval_status: operator.approval_status, // "approved", "pending", or "rejected"
    }));

    RESPONSE.Success.Message = "getAllOperators successfully.";
    RESPONSE.Success.data = operatorsResponse;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // res.status(200).json({ operators: operatorsResponse });
  } catch (error) {
    console.error("getAllOperators:", error);
    RESPONSE.Failure.Message = error.message || "Error fetching operators.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // console.error("getAllOperators:", error);
    // res.status(500).json({ message: "Error fetching operators." });
  }
};

// API to get all operators with their customers' details
exports.getAllOperatorsWithCustomerDetails = async (req, res) => {
  try {
    const operators = await Operator.findAll({
      include: [
        {
          model: Customer,
          through: {
            model: CustomerOperator,
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
