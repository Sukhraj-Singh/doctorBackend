const Joi = require('@hapi/joi');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
var indiaTime = new Date().toLocaleString("en-US", {timeZone: "Asia/Calcutta"});
indiaTime = new Date(indiaTime);
const Doctor = mongoose.model('Doctor', new mongoose.Schema({
  doctor_name: {
    type: String,
    required: true,
    minlength: 0,
    maxlength: 50,
  },
  doctor_details: {
    type: String,
    required: true,
    minlength: 0,
    maxlength: 50
  }
}));

// router.get('/', async (req, res) => {
//   const doctors = await Doctor.find().sort('name');
//   res.send(doctors);
// });

router.get('/', async (req, res) => {
  const doctors = await Doctor.find().sort('name');
  res.send(doctors);
});

router.post('/', async (req, res) => {
  const { error } = validateSlot(req.body); 
  if (error) return res.status(400).send({
    status : "false",
    message : error.details[0].message
  });

  let doctor = new Doctor({ 
    doctor_name: req.body.doctor_name,
    doctor_details: req.body.doctor_details
  });
  doctor = await doctor.save();
  
  res.send({
    status : "true",
    message : "Record added Successfully",
    new_doctor : doctor
  });
});

router.put('/:id', async (req, res) => {
  const { error } = validateSlot(req.body); 
  if (error) return res.status(400).send({
    status: "true",
    message : error.details[0].message
  });

  const doctor = await Slot.findByIdAndUpdate(req.params.id,
    { 
      doctor_name: req.body.from_time,
      doctor_details: req.body.to_time
    }, { new: true });

  if (!doctor) return res.status(404).send({
    status: "false",
    message : "Record not found"
  });
  
  res.send({
    status : "false",
    message : "Record not found",
    updated_record : doctor
  });
});

router.delete('/:id', async (req, res) => {
  const doctor = await Doctor.findByIdAndRemove(req.params.id);

  if (!doctor) return res.status(404).send({
    status: "false",
    message : "Record not Found"
  });

  res.send({
    status: "true",
    message : "Record Deleted"
  });
});

router.get('/:id', async (req, res) => {
  const slot = await Slot.findById(req.params.id);

  if (!slot) return res.status(404).send('The slot with the given ID was not found.');

  res.send(slot);
});

function validateSlot(doctor) {
  const schema = {
    doctor_name: Joi.string().required().min(3).max(50),
    doctor_details: Joi.string().min(3).max(50).required()
  };

  return Joi.validate(doctor, schema);
}

module.exports = router; 