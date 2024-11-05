const db = require("../models");
const Customer = db.customers;
const Operator = db.operators;
const CustomerOperator = db.customerOperator;
const { Op } = require("sequelize"); // Import Op from sequelize
const OTP = db.otp;
const RESPONSE = require("../constants/response");
const { MESSAGE } = require("../constants/message");
const { StatusCode } = require("../constants/HttpStatusCode");

exports.checkCustomerExistForRegister = async (req, res) => {
  try {
    const { email, phone } = req.body;
    // Check if the email already exists
    const emailExists = await Customer.findOne({ where: { email, 
      delete_status: 0  } });
    if (emailExists) {
      RESPONSE.Success.Message = "Email already exists.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    }

    // Check if the phone number already exists
    const phoneExists = await Customer.findOne({ where: { phone, 
      delete_status: 0  } });
    if (phoneExists) {
      RESPONSE.Success.Message = "Phone number already exists.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    }
    RESPONSE.Success.Message = "Success";
    RESPONSE.Success.data = [];
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("checkCustomerExistForRegister:", error);
    RESPONSE.Failure.Message =
      error.message || "Error checkCustomerExistForRegister manager";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// Registration
exports.registerCustomer = async (req, res) => {
  try {
    const { name, email, phone, password,profileImage } = req.body;

    // // Check if email or phone number already exists
    // const existingCustomer = await Customer.findOne({
    //   where: {
    //     [Op.or]: [{ email }, { phone }],
    //   },
    // });

    // if (existingCustomer) {
    //   RESPONSE.Success.Message = "Email or phone number already exists.";
    //   RESPONSE.Success.data = {};
    //   return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    //   // return res
    //   //   .status(400)
    //   //   .json({ message: "Email or phone number already exists." });
    // }

    const emailExists = await Customer.findOne({ where: { email, 
      delete_status: 0  } });
    if (emailExists) {
      RESPONSE.Success.Message = "Email already exists.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    }

    // Check if the phone number already exists
    const phoneExists = await Customer.findOne({ where: { phone, 
      delete_status: 0  } });
    if (phoneExists) {
      RESPONSE.Success.Message = "Phone number already exists.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    }

    const customer = await Customer.create({ name, email, phone, password,profileImage });
    RESPONSE.Success.Message = "Customer registered successfully";
    RESPONSE.Success.data = customer;
    res.status(StatusCode.CREATED.code).send(RESPONSE.Success);
    // res
    //   .status(201)
    //   .json({ message: "Customer registered successfully", customer });
  } catch (error) {
    console.error("registerCustomer:", error);
    RESPONSE.Failure.Message = error.message || "Error registering customer";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res
    //   .status(500)
    //   .json({ message: "Error registering customer", error: error.message });
  }
};

// Registration with otp
// exports.registerCustomer = async (req, res) => {
//   try {
//     const { name, email, phone, password, profileImage, otp } = req.body;

//     // Check if email or phone number already exists
//     // const existingCustomer = await Customer.findOne({
//     //   where: {
//     //     [Op.or]: [{ email }, { phone }],
//     //   },
//     // });

//     // if (existingCustomer) {
//     //   RESPONSE.Success.Message = "Email or phone number already exists.";
//     //   RESPONSE.Success.data = {};
//     //   return res.status(StatusCode.OK.code).send(RESPONSE.Success);
//     // }
//     // Check if the email already exists
//     const emailExists = await Customer.findOne({ where: { email } });
//     if (emailExists) {
//       RESPONSE.Success.Message = "Email already exists.";
//       RESPONSE.Success.data = {};
//       return res.status(StatusCode.OK.code).send(RESPONSE.Success);
//     }

//     // Check if the phone number already exists
//     const phoneExists = await Customer.findOne({ where: { phone } });
//     if (phoneExists) {
//       RESPONSE.Success.Message = "Phone number already exists.";
//       RESPONSE.Success.data = {};
//       return res.status(StatusCode.OK.code).send(RESPONSE.Success);
//     }

//     // Verify OTP
//     const otpData = await OTP.findOne({ where: { email, otp } });

//     if (!otpData) {
//       RESPONSE.Success.Message = MESSAGE.INVALID_OTP;
//       RESPONSE.Success.data = {};
//       return res.status(StatusCode.OK.code).send(RESPONSE.Success);
//     }

//     // Check if the OTP is expired
//     if (otpData.expiresAt < Date.now()) {
//       await OTP.destroy({ where: { email, otp } }); // Remove expired OTP
//       RESPONSE.Success.Message = MESSAGE.OTP_EXPIRED;
//       RESPONSE.Success.data = {};
//       return res.status(StatusCode.OK.code).send(RESPONSE.Success);
//     }

//     // Create the customer if OTP is valid
//     const customer = await Customer.create({
//       name,
//       email,
//       phone,
//       password,
//       profileImage,
//     });

//     // Delete OTP after successful verification
//     await OTP.destroy({ where: { email, otp } });

//     RESPONSE.Success.Message = "Customer registered successfully";
//     RESPONSE.Success.data = customer;
//     res.status(StatusCode.CREATED.code).send(RESPONSE.Success);
//   } catch (error) {
//     console.error("registerCustomer:", error);
//     RESPONSE.Failure.Message = error.message || "Error registering customer";
//     res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
//   }
// };

// Login
exports.loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;
    const customer = await Customer.findOne({ where: { email,
      delete_status: 0 } });
    if (!customer) {
      RESPONSE.Success.Message = "Customer not found!";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      // return res.status(401).json({ message: "Invalid credentials" });
    }

    if (Customer.password !== password) {
      RESPONSE.Success.Message = "Invalid password.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      // return res.status(401).json({ message: "Invalid password." });
    }

    RESPONSE.Success.Message = "Customer logged in successfully";
    RESPONSE.Success.data = customer;
    res.status(StatusCode.CREATED.code).send(RESPONSE.Success);
    // res
    //   .status(200)
    //   .json({ message: "Customer logged in successfully", customer });
  } catch (error) {
    console.error("loginCustomer:", error);
    RESPONSE.Failure.Message = error.message || "Error logging in customer.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res
    //   .status(500)
    //   .json({ message: "Error logging in customer", error: error.message });
  }
};

// Get customer details by customer_id
exports.getCustomerById = async (req, res) => {
  const customerId = req.params.customer_id; // Get customer_id from request parameters

  try {
    const customer = await Customer.findOne({
      where: { customer_id: customerId },
      attributes: { exclude: ["password"] }, // Exclude the password field from the response
    });

    if (!customer) {
      RESPONSE.Failure.Message = "Customer not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
      // return res.status(404).json({ message: "Customer not found." });
    }

    RESPONSE.Success.Message = "getCustomerById successfully.";
    RESPONSE.Success.data = customer;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // res.status(200).json(customer);
  } catch (error) {
    console.error("Error fetching customer by ID:", error);
    RESPONSE.Failure.Message = error.message || "Error fetching customer.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res.status(500).json({ message: "Error fetching customer." });
  }
};

// Edit customer information after verifying OTP
// exports.editCustomerInfo = async (req, res) => {
//   try {
//     const { email, otp, newName, newPhone, newEmail, newPassword, newProfileImage } = req.body;

//     // Verify OTP
//     const otpData = await OTP.findOne({ where: { email, otp } });

//     if (!otpData) {
//       RESPONSE.Success.Message = MESSAGE.INVALID_OTP;
//       RESPONSE.Success.data = {};
//       return res.status(StatusCode.OK.code).send(RESPONSE.Success);
//     }

//     // Check if the OTP is expired
//     if (otpData.expiresAt < Date.now()) {
//       await OTP.destroy({ where: { email, otp } }); // Remove expired OTP
//       RESPONSE.Success.Message = MESSAGE.OTP_EXPIRED;
//       RESPONSE.Success.data = {};
//       return res.status(StatusCode.OK.code).send(RESPONSE.Success);
//     }

//     // OTP is verified, now check if the new email already exists
//     if (newEmail && newEmail !== email) {
//       const emailExists = await Customer.findOne({
//         where: {
//           email: newEmail,
//           customer_id: { [Op.ne]: otpData.customer_id }, // Exclude current customer
//         },
//       });

//       if (emailExists) {
//         RESPONSE.Failure.Message = "The new email is already in use by another customer.";
//         return res.status(StatusCode.CONFLICT.code).send(RESPONSE.Failure);
//       }
//     }

//     // Update customer info
//     const customer = await Customer.findOne({ where: { email } });

//     if (!customer) {
//       RESPONSE.Failure.Message = "Customer not found.";
//       return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
//     }
//     // Prepare the fields to update
//     const updatedFields = {
//       name: newName || customer.name,
//       phone: newPhone || customer.phone,
//       email: newEmail || customer.email,
//       password: newPassword || customer.password,
//       profileImage: newProfileImage || customer.profileImage,
//     };

//     // Update customer using Customer.update()
//     await Customer.update(updatedFields, { where: { email } });

//         // Fetch the updated customer details
//         const updatedCustomer = await Customer.findOne({ where: { email }, attributes: { exclude: ["password"] } });

//     // Delete OTP after successful verification
//     await OTP.destroy({ where: { email, otp } });

//     RESPONSE.Success.Message = "Customer information updated successfully.";
//     RESPONSE.Success.data = updatedCustomer;
//     return res.status(StatusCode.OK.code).send(RESPONSE.Success);
//   } catch (error) {
//     console.error("Error updating customer information:", error);
//     RESPONSE.Failure.Message = error.message || "Failed to update customer information.";
//     return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
//   }
// };

// Edit customer information after verifying OTP
exports.editCustomerInfo = async (req, res) => {
  try {
    const customerId = req.params.customer_id; // Get customer_id from request parameters
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
      const emailExists = await Customer.findOne({
        where: {
          email: newEmail,
          delete_status: 0,
          customer_id: { [Op.ne]: customerId }, // Exclude current customer by ID
        },
      });

      if (emailExists) {
        RESPONSE.Success.Message =
          "The new email is already in use by another customer.";
        RESPONSE.Success.data = {};
        return res.status(StatusCode.OK.code).send(RESPONSE.Success);
        // RESPONSE.Failure.Message = "The new email is already in use by another customer.";
        // return res.status(StatusCode.CONFLICT.code).send(RESPONSE.Failure);
      }
    }

    // Next, check if the new phone number already exists
    if (newPhone) {
      const phoneExists = await Customer.findOne({
        where: {
          phone: newPhone,
          delete_status: 0,
          customer_id: { [Op.ne]: customerId }, // Exclude current customer by ID
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

    // OTP is verified, now check if the new email already exists
    // if (newEmail && newEmail !== email) {
    //   const emailExists = await Customer.findOne({
    //     where: {
    //       email: newEmail,
    //       customer_id: { [Op.ne]: customerId }, // Exclude current customer by ID
    //     },
    //   });

    //   if (emailExists) {
    //     RESPONSE.Failure.Message = "The new email is already in use by another customer.";
    //     return res.status(StatusCode.CONFLICT.code).send(RESPONSE.Failure);
    //   }
    // }

    // Update customer info
    const customer = await Customer.findOne({
      where: { customer_id: customerId },
    });

    if (!customer) {
      RESPONSE.Failure.Message = "Customer not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    // Prepare the fields to update
    const updatedFields = {
      name: newName || customer.name,
      phone: newPhone || customer.phone,
      email: newEmail || customer.email,
      password: newPassword || customer.password,
      profileImage: newProfileImage || customer.profileImage,
    };

    // Update customer using Customer.update()
    await Customer.update(updatedFields, {
      where: { customer_id: customerId },
    });

    // Fetch the updated customer details
    const updatedCustomer = await Customer.findOne({
      where: { customer_id: customerId },
      attributes: { exclude: ["password"] },
    });

    // Delete OTP after successful verification
    await OTP.destroy({ where: { email, otp } });

    RESPONSE.Success.Message = "Customer information updated successfully.";
    RESPONSE.Success.data = updatedCustomer;
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("Error updating customer information:", error);
    RESPONSE.Failure.Message =
      error.message || "Failed to update customer information.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// Soft delete customer by setting delete_status to 1 and updating deletedAt
exports.deleteCustomer = async (req, res) => {
  try {
    const customerId = req.params.customer_id; // Get customer_id from request parameters

    // Find the customer by ID
    const customer = await Customer.findOne({
      where: { customer_id: customerId },
    });

    if (!customer) {
      RESPONSE.Failure.Message = "Customer not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    // Check if the customer is already soft deleted
    if (customer.delete_status === 1) {
      RESPONSE.Failure.Message = "Customer is already deleted.";
      return res.status(StatusCode.OK.code).send(RESPONSE.Failure);
    }

    // Perform soft delete by updating the delete_status and deletedAt fields
    await Customer.update(
      {
        delete_status: 1,
        deletedAt: new Date(), // Set current timestamp as the deleted time
      },
      { where: { customer_id: customerId } }
    );

    RESPONSE.Success.Message = "Customer soft deleted successfully.";
    RESPONSE.Success.data = {};
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("Error in deleting customer:", error);
    RESPONSE.Failure.Message = error.message || "Failed to delete customer.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

exports.getAllCustomersWithOperatorsDetails = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      where: { delete_status: 0 }, // i don't set delete_status for customer  // Fetch active customers
      include: [
        {
          model: Operator,
          through: {
            model: CustomerOperator,
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

// Get customers without assigned operators
exports.getCustomersWithoutOperators = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      where: { delete_status: 0 },
      include: [
        {
          model: Operator,
          through: {
            model: CustomerOperator,
            attributes: [], // Don't include extra fields from the junction table
          },
          required: false, // Include customers even if they don't have associated operators
        },
      ],
      attributes: { exclude: ["password"] }, // Exclude the password field from the response
    });

    // Filter out customers that have associated operators
    const customersWithoutOperators = customers.filter(
      (customer) => customer.operators.length === 0
    );

    RESPONSE.Success.Message = "getCustomersWithoutOperators successfully.";
    RESPONSE.Success.data = customersWithoutOperators;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // res.status(200).json(customersWithoutOperators);
  } catch (error) {
    console.error("Error fetching customers without operators:", error);

    RESPONSE.Failure.Message =
      error.message || "Error fetching customers without operators.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res
    //   .status(500)
    //   .json({ message: "Error fetching customers without operators." });
  }
};

// Get all customer details
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      where: { delete_status: 0 },
      attributes: { exclude: ["password"] }, // Exclude the password field from the response
    });

    RESPONSE.Success.Message = "getAllCustomers successfully.";
    RESPONSE.Success.data = customers;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // res.status(200).json(customers);
  } catch (error) {
    console.error("Error fetching all customers:", error);

    RESPONSE.Failure.Message = error.message || "Error fetching all customers.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res.status(500).json({ message: "Error fetching all customers." });
  }
};

// ===============================================================
// ===============================================================
// ===============================================================


exports.getCustomersWithNewFilter = async (req, res) => {
  // const { customer_id } = req.params; // Ensure operator_id is used only if it’s a field in Customer
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
    const customers = await Customer.findAll({
      where: {
        // customer_id,
        // ...(customer_id ? { customer_id } : {}), // Only include if operator_id is needed as a filter
        // delete_status: 0, // Assumes delete_status exists on Customer
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
      attributes: ["customer_id", "name", "email", "phone"], // Selecting fields directly from Customer
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

exports.getCustomersWithOldFilter = async (req, res) => {
  const { customer_id } = req.params; // Ensure operator_id is used only if it’s a field in Customer
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
    const customers = await Customer.findAll({
      where: {
        // ...(customer_id ? { customer_id } : {}), // Only include if operator_id is needed as a filter
        // delete_status: 0, // Assumes delete_status exists on Customer
        // customer_id,
        ...(startDate && endDate
          ? { createdAt: { [Op.between]: [startDate, endDate] } }
          : {}),
      },
      attributes: ["customer_id", "name", "email", "phone"], // Selecting fields directly from Customer
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
