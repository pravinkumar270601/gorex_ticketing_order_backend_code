const db = require("../models");
const Customer = db.customers;
const Operator = db.operators;
const CustomerOperator = db.customerOperator;
const { Op } = require("sequelize"); // Import Op from sequelize

const RESPONSE = require("../constants/response");
const { MESSAGE } = require("../constants/message");
const { StatusCode } = require("../constants/HttpStatusCode");

// Registration
exports.registerCustomer = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if email or phone number already exists
    const existingCustomer = await Customer.findOne({
      where: {
        [Op.or]: [{ email }, { phone }],
      },
    });

    if (existingCustomer) {
      RESPONSE.Success.Message = "Email or phone number already exists.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      // return res
      //   .status(400)
      //   .json({ message: "Email or phone number already exists." });
    }

    const customer = await Customer.create({ name, email, phone, password });
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

// Login
exports.loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;
    const customer = await Customer.findOne({ where: { email, password } });
    if (!customer) {
      RESPONSE.Success.Message = "Customer not found!";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      // return res.status(401).json({ message: "Invalid credentials" });
    }
    RESPONSE.Success.Message = "Admin logged in successfully";
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

exports.getAllCustomersWithOperatorsDetails = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      // where: { delete_status: 0 }, i don't set delete_status for customer  // Fetch active customers
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
    RESPONSE.Failure.Message =
    error.message || "Error fetching customer.";
  res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res.status(500).json({ message: "Error fetching customer." });
  }
};
