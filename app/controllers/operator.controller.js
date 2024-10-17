const db = require("../models");
const Operator = db.operators;
const { Op } = require("sequelize"); // Import Op from sequelize

// Registration
exports.registerOperator = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if email or phone number already exists
    const existingOperator = await Operator.findOne({
      where: {
        [Op.or]: [{ email }, { phone }],
      },
    });

    if (existingOperator) {
      RESPONSE.Success.Message = "Email or phone number already exists.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      // return res
      //   .status(400)
      //   .json({ message: "Email or phone number already exists." });
    }

    const operator = await Operator.create({ name, email, phone, password });
    RESPONSE.Success.Message = "Operator registered successfully";
    RESPONSE.Success.data = operator;
    res.status(StatusCode.CREATED.code).send(RESPONSE.Success);
    // res
    //   .status(201)
    //   .json({ message: "Operator registered successfully", operator });
  } catch (error) {
    console.error("registerOperator:", error);
    RESPONSE.Failure.Message = error.message || "Error registering manager";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res
    //   .status(500)
    //   .json({ message: "Error registering operator", error: error.message });
  }
};

// Login
exports.loginOperator = async (req, res) => {
  try {
    const { email, password } = req.body;
    const operator = await Operator.findOne({ where: { email, password } });
    if (!operator) {
      RESPONSE.Success.Message = "Operator not found!";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      // return res.status(401).json({ message: "Invalid credentials" });
    }
    RESPONSE.Success.Message = "Operator logged in successfully";
    RESPONSE.Success.data = operator;
    res.status(StatusCode.CREATED.code).send(RESPONSE.Success);
    // res
    //   .status(200)
    //   .json({ message: "Operator logged in successfully", operator });
  } catch (error) {
    console.error("loginManager:", error);
    RESPONSE.Failure.Message = error.message || "Error logging in manager.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res
    //   .status(500)
    //   .json({ message: "Error logging in operator", error: error.message });
  }
};
