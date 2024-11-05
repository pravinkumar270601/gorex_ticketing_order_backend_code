// controllers/customerOperator.controller.js

const db = require("../models");
const CustomerOperator = db.customerOperator;
const Customer = db.customers;
const Operator = db.operators;
const Order = db.orders;

const RESPONSE = require("../constants/response");
const { MESSAGE } = require("../constants/message");
const { StatusCode } = require("../constants/HttpStatusCode");

// Create a new assignment
exports.createAssignment = async (req, res) => {
  try {
    const { customer_id, operator_id } = req.body;

    // Check if the assignment already exists
    const existingAssignment = await CustomerOperator.findOne({
      where: { customer_id, operator_id, delete_status: 0 },
    });

    if (existingAssignment) {
      RESPONSE.Success.Message = "Assignment already exists.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      // return res.status(400).json({ message: "Assignment already exists." });
    }

    // Check if there is an order for the customer with a null operator_id
    // const orderToUpdate = await Order.findOne({
    //   where: { customer_id, operator_id: null, delete_status: 0 },
    // });

    // // Update the one operator_id if such an order exists
    // if (orderToUpdate) {
    //   await Order.update(
    //     { operator_id },
    //     {
    //       where: { order_id: orderToUpdate.order_id },
    //     }
    //   );
    // }

    // Update all orders with a null operator_id for the given customer_id
    await Order.update(
      { operator_id },
      {
        where: { customer_id, operator_id: null, delete_status: 0 },
      }
    );

    // Create a new assignment
    const newAssignment = await CustomerOperator.create({
      customer_id,
      operator_id,
    });

    RESPONSE.Success.Message = "Assignment created successfully.";
    RESPONSE.Success.data = newAssignment;
    res.status(StatusCode.CREATED.code).send(RESPONSE.Success);

    // res.status(201).json({
    //   message: "Assignment created successfully.",
    //   data: newAssignment,
    // });
  } catch (error) {
    console.error("createAssignment:", error);
    RESPONSE.Failure.Message =
      error.message || "An error occurred while creating the assignment.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res.status(500).json({
    //   message: "An error occurred while creating the assignment.",
    //   error: error.message,
    // });
  }
};

// Create multiple assignments
exports.createMultipleAssignments = async (req, res) => {
  try {
    const { customer_ids, operator_id } = req.body; // Expecting an array of customer_ids

    if (!Array.isArray(customer_ids) || customer_ids.length === 0) {
      RESPONSE.Failure.Message = "Provide a valid list of customer IDs.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
      // return res
      //   .status(400)
      //   .json({ message: "Provide a valid list of customer IDs." });
    }

    // Prepare the data for bulk creation
    const assignments = customer_ids.map((customer_id) => ({
      customer_id,
      operator_id,
    }));

    // Check for existing assignments to prevent duplicates
    const existingAssignments = await CustomerOperator.findAll({
      where: {
        customer_id: customer_ids,
        operator_id,
        delete_status: 0,
      },
    });

    // Filter out already existing assignments
    const existingCustomerIds = existingAssignments.map(
      (assignment) => assignment.customer_id
    );
    const newAssignments = assignments.filter(
      (assignment) => !existingCustomerIds.includes(assignment.customer_id)
    );

    if (newAssignments.length === 0) {
      RESPONSE.Success.Message = "All assignments already exist.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      // return res
      //   .status(400)
      //   .json({ message: "All assignments already exist." });
    }

    // Create new assignments
    const createdAssignments = await CustomerOperator.bulkCreate(
      newAssignments
    );

    RESPONSE.Success.Message = "Assignment created successfully.";
    RESPONSE.Success.data = createdAssignments;
    res.status(StatusCode.CREATED.code).send(RESPONSE.Success);
    // res.status(201).json({
    //   message: "Assignments created successfully.",
    //   data: createdAssignments,
    // });
  } catch (error) {
    console.error("createMultipleAssignments:", error);
    RESPONSE.Failure.Message =
      error.message || "An error occurred while creating the assignments.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res.status(500).json({
    //   message: "An error occurred while creating the assignments.",
    //   error: error.message,
    // });
  }
};

// Retrieve all assignments
exports.getAllAssignments = async (req, res) => {
  try {
    const assignments = await CustomerOperator.findAll({
      where: { delete_status: 0 },
      include: [
        {
          model: Customer,
          attributes: ["customer_id", "name", "email", "phone"],
        },
        {
          model: Operator,
          attributes: ["operator_id", "name", "email", "phone"],
        },
      ],
    });

    RESPONSE.Success.Message = "Assignments retrieved successfully.";
    RESPONSE.Success.data = assignments;
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // res.status(200).json({
    //   message: "Assignments retrieved successfully.",
    //   data: assignments,
    // });
  } catch (error) {
    console.error("getAllAssignments:", error);
    RESPONSE.Failure.Message =
      error.message || "An error occurred while retrieving the assignments.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res.status(500).json({
    //   message: "An error occurred while retrieving the assignments.",
    //   error: error.message,
    // });
  }
};

// Update an assignment
exports.updateAssignment = async (req, res) => {
  try {
    const { assignment_id } = req.params;
    const { customer_id, operator_id } = req.body;

    // Update the assignment directly using .update()
    const [updatedRows] = await CustomerOperator.update(
      { customer_id, operator_id },
      { where: { id: assignment_id, delete_status: 0 } }
    );

    if (updatedRows === 0) {
      // Find the assignment to see if it's due to no changes or if it doesn't exist
      const existingAssignment = await CustomerOperator.findOne({
        where: { id: assignment_id, delete_status: 0 },
      });

      if (!existingAssignment) {
        RESPONSE.Success.Message = "Assignment not found or already deleted.";
        RESPONSE.Success.data = {};
        return res.status(StatusCode.OK.code).send(RESPONSE.Success);
        // return res
        //   .status(404)
        //   .json({ message: "Assignment not found or already deleted." });
      }

      // If the assignment exists but no changes were made
      RESPONSE.Success.Message =
        "No changes detected. The assignment is already up to date.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      // return res.status(200).json({
      //   message: "No changes detected. The assignment is already up to date.",
      // });

      // return res
      //   .status(404)
      //   .json({ message: "Assignment not found or already deleted." });
    }
    RESPONSE.Success.Message = "Assignment updated successfully.";
    RESPONSE.Success.data = {};
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // res.status(200).json({
    //   message: "Assignment updated successfully.",
    // });
  } catch (error) {
    console.error("updateAssignment:", error);
    RESPONSE.Failure.Message =
      error.message || "An error occurred while updating the assignment";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res.status(500).json({
    //   message: "An error occurred while updating the assignment.",
    //   error: error.message,
    // });
  }
};

// Soft delete an assignment
exports.deleteAssignment = async (req, res) => {
  try {
    const { assignment_id } = req.params;

    // Update the delete_status to 1 for soft deletion
    const [updatedRows] = await CustomerOperator.update(
      { delete_status: 1 },
      { where: { id: assignment_id, delete_status: 0 } }
    );

    if (updatedRows === 0) {
      // Check if the assignment actually exists but is already deleted
      const existingAssignment = await CustomerOperator.findOne({
        where: { id: assignment_id },
      });
      if (existingAssignment && existingAssignment.delete_status === 1) {
        RESPONSE.Failure.Message = "Assignment not found.";
        return res.status(StatusCode.BAD_REQUEST.code).send(RESPONSE.Failure);
        // return res.status(400).json({
        //   message: "Assignment is already deleted.",
        // });
      } else {
        RESPONSE.Failure.Message = "Assignment not found.";
        return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
        // return res.status(404).json({
        //   message: "Assignment not found.",
        // });
      }
    }
    // If rows were updated successfully, return a success response
    RESPONSE.Success.Message = "Assignment deleted successfully.";
    RESPONSE.Success.data = {};
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // res.status(200).json({ message: "Assignment deleted successfully." });
  } catch (error) {
    console.error("deleteAssignment:", error);
    RESPONSE.Failure.Message =
      error.message || "An error occurred while updating the assignment";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res.status(500).json({
    //   message: "An error occurred while deleting the assignment.",
    //   error: error.message,
    // });
  }
};

// Update the operator assignment for a customer
// exports.updateOperatorAssignment = async (req, res) => {
//   const { customer_id, operator_id } = req.body;

//   try {
//     // Update the operator_id to the new value or null
//     const [updatedRows] = await CustomerOperator.update(
//       { operator_id },
//       { where: { customer_id, delete_status: 0 } }
//     );

//     if (updatedRows === 0) {
//       // Check if the assignment exists but the operator_id is already the same
//       const existingAssignment = await CustomerOperator.findOne({
//         where: { customer_id, delete_status: 0 },
//       });

//       if (
//         existingAssignment &&
//         existingAssignment.operator_id === operator_id
//       ) {
//         RESPONSE.Success.Message =
//           "No changes detected. The operator assignment is already up to date.";
//         RESPONSE.Success.data = {};
//         res.status(StatusCode.OK.code).send(RESPONSE.Success);
//         // return res.status(200).json({
//         //   message:
//         //     "No changes detected. The operator assignment is already up to date.",
//         // });
//       } else {
//         RESPONSE.Failure.Message =
//           "Customer assignment not found or already deleted.";
//         return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
//         // return res.status(404).json({
//         //   message: "Customer assignment not found or already deleted.",
//         // });
//       }
//       // return res
//       //   .status(404)
//       //   .json({ message: "Customer assignment not found or already deleted." });
//     }

//     // Update all orders with a null operator_id for the given customer_id
//     await Order.update(
//       { operator_id },
//       {
//         where: { customer_id, operator_id: null, delete_status: 0 },
//       }
//     );

//     RESPONSE.Success.Message =
//       operator_id === null
//         ? "Operator assignment removed successfully."
//         : "Operator assignment updated successfully.";
//     RESPONSE.Success.data = {};
//     res.status(StatusCode.OK.code).send(RESPONSE.Success);
//     // res.status(200).json({
//     //   message:
//     //     operator_id === null
//     //       ? "Operator assignment removed successfully."
//     //       : "Operator assignment updated successfully.",
//     // });
//   } catch (error) {
//     console.error("updateOperatorAssignment:", error);
//     RESPONSE.Failure.Message =
//       error.message || "An error occurred while updating the assignment";
//     res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
//     // res.status(500).json({
//     //   message: "An error occurred while updating the operator assignment.",
//     //   error: error.message,
//     // });
//   }
// };

/// Update the operator assignment for a customer with 
// new logic of deteleAt with time for filer 
exports.updateOperatorAssignment = async (req, res) => {
  const { customer_id, operator_id } = req.body;

  try {
    // Find the existing active assignment
    const existingAssignment = await CustomerOperator.findOne({
      where: { customer_id, delete_status: 0 },
    });

    // Check if the assignment already exists with the same operator_id
    if (existingAssignment && existingAssignment.operator_id === operator_id) {
      RESPONSE.Success.Message = "No changes detected. The operator assignment is already up to date.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    }

    // If there is an existing assignment, soft delete it
    if (existingAssignment) {
      await CustomerOperator.update(
        {
          delete_status: 1,
          deletedAt: new Date(), // Set the deleted date
        },
        { where: { customer_id, delete_status: 0 } }
      );
    }

    // Create a new assignment with the updated operator_id
    const newAssignment = await CustomerOperator.create({
      customer_id,
      operator_id,
      delete_status: 0, // Set as active
    });

    // Optionally, update orders related to the customer
    await Order.update(
      { operator_id },
      {
        where: { customer_id, operator_id: null, delete_status: 0 },
      }
    );

    RESPONSE.Success.Message = operator_id === null
      ? "Operator assignment removed successfully."
      : "Operator assignment updated successfully.";
    RESPONSE.Success.data = { newAssignment };
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("updateOperatorAssignment:", error);
    RESPONSE.Failure.Message = error.message || "An error occurred while updating the assignment";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};





// Get customers based on operator_id
exports.getCustomersByOperator = async (req, res) => {
  const { operator_id } = req.params;

  try {
    // Fetch customers assigned to the operator
    const customers = await CustomerOperator.findAll({
      where: {
        operator_id,
        delete_status: 0, // Active assignments only
      },
      include: [
        {
          model: Customer, // Assuming there is a Customer model
          attributes: ["customer_id", "name", "email", "phone"], // Select necessary fields
        },
      ],
    });

    // If no customers found
    if (!customers || customers.length === 0) {
      RESPONSE.Success.Message =
        "No customers found for the specified operator.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      // return res.status(404).json({
      //   message: "No customers found for the specified operator.",
      // });
    }

    // Return the list of customers
    RESPONSE.Success.Message = "Customers fetched successfully.";
    RESPONSE.Success.data = customers;
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // res.status(200).json({
    //   message: "Customers fetched successfully.",
    //   data: customers,
    // });
  } catch (error) {
    console.error("getCustomersByOperator:", error);
    RESPONSE.Failure.Message = error.message || "An error occurred while fetching customers.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res.status(500).json({
    //   message: "An error occurred while fetching customers.",
    //   error: error.message,
    // });
  }
};
