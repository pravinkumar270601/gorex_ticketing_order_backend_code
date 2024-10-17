// const express = require("express");
const db = require("../models");
const Tutorial = db.tutorials;

const RESPONSE = require("../constants/response");
const { MESSAGE } = require("../constants/message");
const { StatusCode } = require("../constants/HttpStatusCode");

//create and save new tutorial
exports.create = async(req,res,next) => {
  try{
    const data ={
      firstName: req.body.firstname,
      lastName:req.body.lastName,
      emailAddress:req.body.emailAddress,
      phoneNumber:req.body.phoneNumber,
      gender:req.body.gender
    }
    const response = await Tutorial.create(data);

    RESPONSE.Success.Message = MESSAGE.SUCCESS;
    RESPONSE.Success.data = {id: response.id};
    res.status(StatusCode.CREATED.code).send(RESPONSE.Success);
  }
  catch(error){
    RESPONSE.Failure.Message = err.message;
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
}

// Retrieve all Tutorials from the database.
exports.getUserDetails =async (req, res,next) => {
  try{
    const response =await Tutorial.findAll({
      attributes:{exclude:['createdAt','updatedAt']}
    });
    console.log("response",response)
    res.status(200).send({data:response})
  }
  catch(error){
    next(error)
  }
};


// Find a single Tutorial with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Tutorial.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Tutorial with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Tutorial with id=" + id
      });
    });
};

// Update a Tutorial by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Tutorial.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Tutorial was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Tutorial with id=${id}. Maybe Tutorial was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Tutorial with id=" + id
      });
    });
};

// Delete a Tutorial with the specified id in the request
exports.delete = async(req, res,next) => {
  try{
    const id = req.params.id;
    const data = {
      delete_status:1
    }
    const response =await Tutorial.update(data,{
      where:{
        id:id
      }
      })
      console.log(response,"response")
    res.status(200).send({})
    }catch(error){
     next(error)
  }
}
  

  

// Delete all Tutorials from the database.
exports.deleteAll = (req, res) => {
  Tutorial.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Tutorials were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all tutorials."
      });
    });
};

// find all published Tutorial
exports.findAllPublished = (req, res) => {
  Tutorial.findAll({ where: { published: true } })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials."
      });
    });
};
