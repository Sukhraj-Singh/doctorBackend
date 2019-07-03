const Joi = require('@hapi/joi');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
var indiaTime = new Date().toLocaleString("en-US", {timeZone: "Asia/Calcutta"});
indiaTime = new Date(indiaTime);
const Booking = mongoose.model('Booking', new mongoose.Schema({
  doctor_id : {
    type: String,
    required: true,
    minlength: 24,
    maxlength: 24
  },
  slot_id : {
    type: String,
    required: true,
    minlength: 24,
    maxlength: 24
  },
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50
  },
  details: {
    type: String,
    required: true,
    minlength: 0,
    maxlength: 500
  },
  phone: {
    type: Number,
    required: true,
    length: 10
  },
  date: {
    type: String,
    required: true,
    default: new Date().toLocaleString('en-US', { timeZone: 'Asia/Calcutta'}).slice(0,8)
  }
}));

router.get('/', async (req, res) => {
  const bookings = await Booking.find({ date :  new Date().toLocaleString('en-US', { timeZone: 'Asia/Calcutta'}).slice(0,8)}).sort('name');
  res.send(bookings);
});

router.get('/:id', async (req, res) => {
  const slots = await Booking.find({ doctor_id : req.params.id, date: new Date().toLocaleString('en-US', { timeZone: 'Asia/Calcutta'}).slice(0,8)}).sort('name');
  res.send(slots);
});

router.post('/', async (req, res) => {
  const { error } = validateSlot(req.body); 
  if (error) return res.status(400).send({
    status : "false",
    message : error.details[0].message
  });
  let booking = new Booking({
    doctor_id : req.body.doctor_id,
    slot_id : req.body.slot_id,
    name: req.body.name,  
    details: req.body.details, 
    phone: req.body.phone, 
    date: req.body.date
  });
  booking = await booking.save();
  
  res.send({
    status : "true",
    message : "Record added Successfully",
    new_slot : booking,
  });
  
});

router.put('/:id', async (req, res) => {
  const { error } = validateSlot(req.body); 
  if (error) return res.status(400).send({
    status: "true",
    message : error.details[0].message
  });

  const booking = await Booking.findByIdAndUpdate(req.params.id,
    { 
      from_time: req.body.from_time,
      to_time: req.body.to_time
    }, { new: true });

  if (!booking) return res.status(404).send({
    status: "false",
    message : "Record not found"
  });
  
  res.send({
    status : "false",
    message : "Record not found",
    updated_slot : booking
  });
});

router.delete('/:id', async (req, res) => {
  const booking = await Booking.findByIdAndRemove(req.params.id);

  if (!booking) return res.status(404).send({
    status: "false",
    message : "Record not Found"
  });

  res.send({
    status: "true",
    message : "Record Deleted"
  });
});

router.get('/:id', async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) return res.status(404).send('The booking with the given ID was not found.');

  res.send(booking);
});

function validateSlot(booking) {
  const schema = {
      doctor_id : Joi.string().min(24).max(24).required(),
      slot_id : Joi.string().min(24).max(24).required(),
      name: Joi.string().min(3).max(50).required(),
      details: Joi.string().min(0).max(500).required(),
      phone: Joi.number().integer().min(1000000000).max(9999999999).required(),
      date: Joi.date()
  };

  return Joi.validate(booking, schema);
}

module.exports = router; 