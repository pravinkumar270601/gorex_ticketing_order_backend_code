const db = require("../models");
const Manager = db.managers;
const { Op } = require("sequelize"); // Import Op from sequelize
const OTP = db.otp;
const RESPONSE = require("../constants/response");
const { MESSAGE } = require("../constants/message");
const { StatusCode } = require("../constants/HttpStatusCode");

exports.createDefaultManagers = async () => {
  try {
    // Step 1: Define multiple hardcoded Managers
    const hardcodedManagers = [
      {
        name: "Backup Manager",
        email: "backupmanager@gorex.in",
        phone: "4567890123",
        password: "1234",
      },
      // {
      //   name: "Primary Manager",
      //   email: "primarymanager@gorex.in",
      //   phone: "1234567890",
      //   password: "1234", // Default password
      // },
      // {
      //   name: "Secondary Manager",
      //   email: "secondarymanager@gorex.in",
      //   phone: "2345678901",
      //   password: "1234", // Default password
      // },
    ];

    // Step 2: Iterate through each hardcoded Manager and create if not exists
    for (const managerData of hardcodedManagers) {
      const emailExists = await Manager.findOne({
        where: { email: managerData.email, delete_status: 0 },
      });

      if (!emailExists) {
        // Create Manager if no conflict
        await Manager.create(managerData);
        // console.log(`Hardcoded Manager created: ${managerData.email}`);
      } else {
        // console.log(`Manager with email ${managerData.email} already exists.`);
      }
    }

    // Step 3: Parse Managers from the .env file if provided
    const defaultManagers = JSON.parse(process.env.MANAGERS || "[]"); // Ensure default is empty if undefined

    // Step 4: Iterate over Managers from the .env file and create them
    for (const managerData of defaultManagers) {
      // Check if email already exists
      const emailExists = await Manager.findOne({
        where: { email: managerData.email, delete_status: 0 },
      });
      if (emailExists) {
        // console.log(`Manager with email ${managerData.email} already exists.`);
        continue; // Skip to the next Manager
      }

      // Check if phone number already exists
      const phoneExists = await Manager.findOne({
        where: { phone: managerData.phone, delete_status: 0 },
      });
      if (phoneExists) {
        // console.log(
        //   `Manager with phone number ${managerData.phone} already exists.`
        // );
        continue; // Skip to the next Manager
      }

      // Create the Manager if no email or phone conflict
      await Manager.create(managerData);
      // console.log(`Manager created from .env: ${managerData.email}`);
    }
  } catch (error) {
    // console.error("Error creating default Managers:", error);
  }
};

exports.checkManagerExistForRegister = async (req, res) => {
  try {
    const { email, phone } = req.body;
    // Check if the email already exists
    const emailExists = await Manager.findOne({
      where: { email, delete_status: 0 },
    });
    if (emailExists) {
      RESPONSE.Success.Message = "Email already exists.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    }

    // Check if the phone number already exists
    const phoneExists = await Manager.findOne({
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
    console.error("checkManagerExistForRegister:", error);
    RESPONSE.Failure.Message =
      error.message || "Error checkManagerExistForRegister";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// Registration
exports.registerManager = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // // Check if email or phone number already exists
    // const existingManager = await Manager.findOne({
    //   where: {
    //     [Op.or]: [{ email }, { phone }],
    //   },
    // });

    // if (existingManager) {
    //   RESPONSE.Success.Message = "Email or phone number already exists.";
    //   RESPONSE.Success.data = {};
    //   return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    //   // return res
    //   //   .status(400)
    //   //   .json({ message: "Email or phone number already exists." });
    // }

    const emailExists = await Manager.findOne({
      where: { email, delete_status: 0 },
    });
    if (emailExists) {
      RESPONSE.Success.Message = "Email already exists.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    }

    // Check if the phone number already exists
    const phoneExists = await Manager.findOne({
      where: { phone, delete_status: 0 },
    });
    if (phoneExists) {
      RESPONSE.Success.Message = "Phone number already exists.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
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
    const manager = await Manager.findOne({ where: { email, delete_status: 0 } });
    if (!manager) {
      RESPONSE.Success.Message = "Manager not found!";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      // return res.status(401).json({ message: "Invalid credentials" });
    }
    if (manager.password !== password) {
      RESPONSE.Success.Message = "Invalid password.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      // return res.status(401).json({ message: "Invalid password." });
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

// Get manager details by manager_id
exports.getManagerById = async (req, res) => {
  const managerId = req.params.manager_id; // Get manager_id from request parameters

  try {
    const manager = await Manager.findOne({
      where: { manager_id: managerId },
      // attributes: { exclude: ["password"] }, // Exclude the password field from the response
    });

    if (!manager) {
      RESPONSE.Failure.Message = "Manager not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
      // return res.status(404).json({ message: "Manager not found." });
    }

    RESPONSE.Success.Message = "getManagerById successfully.";
    RESPONSE.Success.data = manager;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // res.status(200).json(manager);
  } catch (error) {
    console.error("Error fetching manager by ID:", error);

    RESPONSE.Failure.Message = error.message || "Error fetching manager.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res.status(500).json({ message: "Error fetching manager." });
  }
};

// Soft delete manager by setting delete_status to 1 and updating deletedAt
exports.deleteManager = async (req, res) => {
  try {
    const managerId = req.params.manager_id; // Get manager_id from request parameters

    // Find the manager by ID
    const manager = await Manager.findOne({ where: { manager_id: managerId } });

    if (!manager) {
      RESPONSE.Failure.Message = "Manager not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    // Check if the manager is already soft deleted
    if (manager.delete_status === 1) {
      RESPONSE.Failure.Message = "Manager is already deleted.";
      return res.status(StatusCode.OK.code).send(RESPONSE.Failure);
    }

    // Perform soft delete by updating the delete_status and deletedAt fields
    await Manager.update(
      {
        delete_status: 1,
        deletedAt: new Date(), // Set current timestamp as the deleted time
      },
      { where: { manager_id: managerId } }
    );

    RESPONSE.Success.Message = "Manager soft deleted successfully.";
    RESPONSE.Success.data = {};
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("Error in deleting manager:", error);
    RESPONSE.Failure.Message = error.message || "Failed to delete manager.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// Edit manager information after verifying OTP
exports.editManagerInfo = async (req, res) => {
  try {
    const managerId = req.params.manager_id; // Get manager_id from request parameters
    const {
      email,
      otp,
      newName,
      newPhone,
      newEmail,
      newPassword,
      newProfileImage,
    } = req.body;

    // Check if the new email already exists
    if (newEmail && newEmail !== email) {
      const emailExists = await Manager.findOne({
        where: {
          email: newEmail,
          manager_id: { [Op.ne]: managerId }, // Exclude current manager by ID
          delete_status: 0,
        },
      });

      if (emailExists) {
        RESPONSE.Success.Message =
          "The new email is already in use by another manager.";
        RESPONSE.Success.data = {};
        return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      }
    }

    // Check if the new phone number already exists
    if (newPhone) {
      const phoneExists = await Manager.findOne({
        where: {
          phone: newPhone,
          manager_id: { [Op.ne]: managerId }, // Exclude current manager by ID
          delete_status: 0,
        },
      });

      if (phoneExists) {
        RESPONSE.Success.Message =
          "The new phone number is already in use by another manager.";
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

    // Find the manager by ID
    const manager = await Manager.findOne({
      where: { manager_id: managerId },
    });

    if (!manager) {
      RESPONSE.Failure.Message = "Manager not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    // Prepare the fields to update
    const updatedFields = {
      name: newName || manager.name,
      phone: newPhone || manager.phone,
      email: newEmail || manager.email,
      password: newPassword || manager.password,
      profileImage: newProfileImage || manager.profileImage,
    };

    // Update manager using Manager.update()
    await Manager.update(updatedFields, {
      where: { manager_id: managerId },
    });

    // Fetch the updated manager details
    const updatedManager = await Manager.findOne({
      where: { manager_id: managerId },
      attributes: { exclude: ["password"] },
    });

    // Delete OTP after successful verification
    await OTP.destroy({ where: { email, otp } });

    RESPONSE.Success.Message = "Manager information updated successfully.";
    RESPONSE.Success.data = updatedManager;
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("Error updating manager information:", error);
    RESPONSE.Failure.Message =
      error.message || "Failed to update manager information.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

exports.checkEmailPhoneAvailabilityForManager = async (req, res) => {
  try {
    const managerId = req.params.manager_id; // Get manager_id from request parameters
    const { email, phone } = req.body; // Get email and phone from the request body

    // Validation: Check if either email or phone is provided
    if (!email && !phone) {
      RESPONSE.Failure.Message = "Email or phone number is required.";
      return res.status(StatusCode.BAD_REQUEST.code).send(RESPONSE.Failure);
    }

    // Check if the new email already exists for another manager
    if (email) {
      const emailExists = await Manager.findOne({
        where: {
          email,
          delete_status: 0,
          manager_id: { [Op.ne]: managerId }, // Exclude current manager by ID
        },
      });

      if (emailExists) {
        RESPONSE.Success.Message = "The email is already in use by another manager.";
        RESPONSE.Success.data = {};
        return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      }
    }

    // Check if the new phone number already exists for another manager
    if (phone) {
      const phoneExists = await Manager.findOne({
        where: {
          phone,
          delete_status: 0,
          manager_id: { [Op.ne]: managerId }, // Exclude current manager by ID
        },
      });

      if (phoneExists) {
        RESPONSE.Success.Message = "The phone number is already in use by another manager.";
        RESPONSE.Success.data = {};
        return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      }
    }

    // If no conflicts are found, return success response
    RESPONSE.Success.Message = "Email and phone are available.";
    RESPONSE.Success.data = {};
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);

  } catch (error) {
    console.error("Error checking email and phone availability:", error);
    RESPONSE.Failure.Message = error.message || "Failed to check email and phone availability.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};


exports.resetPasswordForManager = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Check if the manager with the specified email and delete_status of 0 exists
    const manager = await Manager.findOne({
      where: {
        email,
        delete_status: 0, // Ensure the manager is active
      },
    });

    if (!manager) {
      RESPONSE.Success.Message = "Manager not found! Please sign up.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      // RESPONSE.Failure.Message = "Manager not found! Please sign up.";
      // return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    // Update the password
    await Manager.update({ password: newPassword }, { where: { email } });

    RESPONSE.Success.Message = "Password has been reset successfully.";
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("Error resetting manager password:", error);
    RESPONSE.Failure.Message =
      error.message || "Failed to reset password.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};