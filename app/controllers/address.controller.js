// controllers/address.controller.js
const db = require("../models");
const Address = db.addresses;
const RESPONSE = require("../constants/response");
const { MESSAGE } = require("../constants/message");
const { StatusCode } = require("../constants/HttpStatusCode");

exports.createAddress = async (req, res) => {
  try {
    // Validate request body (add any necessary validation checks)
    if (
      !req.body.state ||
      !req.body.district ||
      !req.body.city ||
      !req.body.location ||
      !req.body.station
    ) {
      RESPONSE.Failure.Message = "All fields are required.";
      return res.status(StatusCode.BAD_REQUEST.code).send(RESPONSE.Failure);
      // return res.status(400).json({ message: 'All fields are required' });
    }

    const address = await Address.create(req.body);
    RESPONSE.Success.Message = "Address created successfully.";
    RESPONSE.Success.data = address;
    res.status(StatusCode.CREATED.code).send(RESPONSE.Success);
    // res.status(201).json({ message: 'Address created successfully', address });
  } catch (error) {
    console.error("Error creating address:", error);
    if (error.name === "SequelizeValidationError") {
      RESPONSE.Failure.Message = error.errors;
      return res.status(StatusCode.BAD_REQUEST.code).send(RESPONSE.Failure);
      // return res.status(400).json({ message: 'Validation error', details: error.errors });
    }
    RESPONSE.Failure.Message = error.message || "Error creating address.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res.status(500).json({ message: 'Error creating address', error: error.message });
  }
};

exports.getAllAddresses = async (req, res) => {
  try {
    const addresses = await Address.findAll({ where: { delete_status: 0 } });
    RESPONSE.Success.Message = "getAllAddresses successfully.";
    RESPONSE.Success.data = addresses;
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // res.status(200).json(addresses);
  } catch (error) {
    console.error("Error fetching addresses:", error);
    RESPONSE.Failure.Message = error.message || "Error fetching addresses.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res
    //   .status(500)
    //   .json({ message: "Error fetching addresses", error: error.message });
  }
};

exports.getAddressById = async (req, res) => {
  try {
    const address = await Address.findOne({
      where: { address_id: req.params.address_id, delete_status: 0 },
    });
    if (!address) {
      RESPONSE.Failure.Message = "Address not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
      // return res.status(404).json({ message: "Address not found" });
    }
    RESPONSE.Success.Message = "getAddressById successfully.";
    RESPONSE.Success.data = address;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // res.status(200).json(address);
  } catch (error) {
    console.error("Error fetching address:", error);
    RESPONSE.Failure.Message = error.message || "Error fetching address";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res
    //   .status(500)
    //   .json({ message: "Error fetching address", error: error.message });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      where: { address_id: req.params.address_id },
    });
    if (!address) {
      RESPONSE.Failure.Message = "Address not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
      // return res.status(404).json({ message: "Address not found" });
    }

    // Validate request body (add any necessary validation checks)
    if (
      !req.body.state &&
      !req.body.district &&
      !req.body.city &&
      !req.body.location &&
      !req.body.station
    ) {
      RESPONSE.Failure.Message = "At least one field is required to update.";
      return res.status(StatusCode.BAD_REQUEST.code).send(RESPONSE.Failure);
      // return res
      //   .status(400)
      //   .json({ message: "At least one field is required to update" });
    }

    await address.update(req.body);
    RESPONSE.Success.Message = "Address updated successfully.";
    RESPONSE.Success.data = address;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // res.status(200).json({ message: "Address updated successfully", address });
  } catch (error) {
    console.error("Error updating address:", error);
    if (error.name === "SequelizeValidationError") {
      RESPONSE.Failure.Message = error.errors;
      return res.status(StatusCode.BAD_REQUEST.code).send(RESPONSE.Failure);
      // return res.status(400).json({ message: 'Validation error', details: error.errors });
    }
    RESPONSE.Failure.Message = error.message || "Error updating address.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res.status(500).json({ message: 'Error creating address', error: error.message });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      where: { address_id: req.params.address_id },
    });
    if (!address) {
      RESPONSE.Failure.Message = "Address not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
      // return res.status(404).json({ message: "Address not found" });
    }

    await address.update({ delete_status: 1, deletedAt: new Date() });
    RESPONSE.Success.Message = "Address deleted successfully.";
    RESPONSE.Success.data = {};
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    console.error("Error deleting address:", error);
    RESPONSE.Failure.Message = error.message || "Error deleting address";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res
    //   .status(500)
    //   .json({ message: "Error deleting address", error: error.message });
  }
};

exports.getAllAddressesDropdown = async (req, res) => {
  try {
    const addresses = await Address.findAll({
      where: { delete_status: 0 },
      attributes: [
        "address_id",
        "state",
        "district",
        "city",
        "location",
        "station",
      ],
    });

    const formattedAddresses = addresses.map((address) => {
      return {
        address_id: address.address_id,
        full_address: `${address.state}, ${address.district}, ${address.city}, ${address.location}, ${address.station}`,
      };
    });

    RESPONSE.Success.Message = "formattedAddresses successfully.";
    RESPONSE.Success.data = formattedAddresses;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // res.status(200).json(formattedAddresses);
  } catch (error) {
    RESPONSE.Failure.Message = error.message || "Error fetching addresses";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res.status(500).json({ message: "Error fetching addresses", error });
  }
};
 