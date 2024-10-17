const db = require("../models");
const Manager = db.managers;
const { Op } = require("sequelize"); // Import Op from sequelize

const RESPONSE = require("../constants/response");
const { MESSAGE } = require("../constants/message");
const { StatusCode } = require("../constants/HttpStatusCode");

// Registration
exports.registerManager = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if email or phone number already exists
    const existingManager = await Manager.findOne({
      where: {
        [Op.or]: [{ email }, { phone }],
      },
    });

    if (existingManager) {
      RESPONSE.Success.Message = "Email or phone number already exists.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      // return res
      //   .status(400)
      //   .json({ message: "Email or phone number already exists." });
    }

    const manager = await Manager.create({ name, email, phone, password });
    RESPONSE.Success.Message = "Manager registered successfully";
    RESPONSE.Success.data = manager;
    res.status(StatusCode.CREATED.code).send(RESPONSE.Success);
    // res
    //   .status(201)
    //   .json({ message: "Manager registered successfully", manager });
  } catch (error) {
    console.error("registerManager:", error);
    RESPONSE.Failure.Message = error.message || "Error registering manager";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res
    //   .status(500)
    //   .json({ message: "Error registering manager", error: error.message });
  }
};


// Login
exports.loginManager = async (req, res) => {
  try {
    const { email, password } = req.body;
    const manager = await Manager.findOne({ where: { email, password } });
    if (!manager){
      RESPONSE.Success.Message = "Manager not found!";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      // return res.status(401).json({ message: "Invalid credentials" });
    }
    RESPONSE.Success.Message = "Manager logged in successfully";
    RESPONSE.Success.data = manager;
    res.status(StatusCode.CREATED.code).send(RESPONSE.Success);
    // res
    //   .status(200)
    //   .json({ message: "Manager logged in successfully", manager });
  } catch (error) {
    console.error("loginManager:", error);
    RESPONSE.Failure.Message = error.message || "Error logging in manager.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res
    //   .status(500)
    //   .json({ message: "Error logging in manager", error: error.message });
  }
};
