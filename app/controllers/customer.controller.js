const db = require("../models");
const Customer = db.customers;
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
