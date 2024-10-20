const db = require("../models");
const Admin = db.admins;
const { Op } = require("sequelize"); // Import Op from sequelize

const RESPONSE = require("../constants/response");
const { MESSAGE } = require("../constants/message");
const { StatusCode } = require("../constants/HttpStatusCode");

// Registration
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if email or phone number already exists
    const existingAdmin = await Admin.findOne({
      where: {
        [Op.or]: [{ email }, { phone }],
      },
    });

    if (existingAdmin) {
      RESPONSE.Success.Message = "Email or phone number already exists.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);

      // return res
      //   .status(400)
      //   .json({ message: "Email or phone number already exists." });
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
    RESPONSE.Failure.Message =
      error.message || "Error fetching admin.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // console.error("Error fetching admin by ID:", error);
    // res.status(500).json({ message: "Error fetching admin." });
  }
};