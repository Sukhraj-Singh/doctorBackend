const Joi = require('@hapi/joi');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const moment = require('moment');
var indiaTime = new Date().toLocaleString("en-US", {timeZone: "Asia/Calcutta"});
indiaTime = new Date(indiaTime);
const Slot = mongoose.model('Slot', new mongoose.Schema({
  doctor_id : {
    type: String,
    required: true,
    minlength: 24,
    maxlength: 24
  },
  from_time: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 4
  },
  to_time: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 4
  },
  date: {
    type: String,
    required: true,
    default: new Date().toLocaleString('en-US', { timeZone: 'Asia/Calcutta'}).slice(0,8)
  }
}));

router.get('/:id', async (req, res) => {
  
  const date = parseFloat(moment().format('HHmm'));
  
  const slots = await Slot.find({ doctor_id : req.params.id, date: new Date().toLocaleString('en-US', { timeZone: 'Asia/Calcutta'}).slice(0,8)})
  .and({from_time : { $gt : date }})
  .sort('name');
  res.send(slots);
});

router.post('/', async (req, res) => {
  const { error } = validateSlot(req.body); 
  if (error) return res.status(400).send({
    status : "false",
    message : error.details[0].message
  });
  const slots = await Slot.find()
  .or([ {from_time: {$gte:req.body.from_time, $lte:req.body.to_time}},
        {to_time: {$gte:req.body.from_time, $lte:req.body.to_time}}])
  .and( {doctor_id: req.body.doctor_id})
  .sort('name');
  if(slots.length == 0 && req.body.to_time>req.body.from_time){
    let slot = new Slot({
      doctor_id : req.body.doctor_id,
      from_time: req.body.from_time,  
      to_time: req.body.to_time
    });
    slot = await slot.save();
    
    res.send({
      status : "true",
      message : "Record added Successfully",
      new_slot : slot
    });
    
  }else{
    res.send({
      
      status : "false",
      message : "Please choose the correct time slot"
    });
  }
  
});

router.put('/:id', async (req, res) => {
  const { error } = validateSlot(req.body); 
  if (error) return res.status(400).send({
    status: "true",
    message : error.details[0].message
  });

  const slot = await Slot.findByIdAndUpdate(req.params.id,
    { 
      from_time: req.body.from_time,
      to_time: req.body.to_time
    }, { new: true });

  if (!slot) return res.status(404).send({
    status: "false",
    message : "Record not found"
  });
  
  res.send({
    status : "false",
    message : "Record not found",
    updated_slot : slot
  });
});

router.delete('/:id', async (req, res) => {
  const slot = await Slot.findByIdAndRemove(req.params.id);

  if (!slot) return res.status(404).send({
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

function validateSlot(slot) {
  const schema = {
      doctor_id : Joi.string().min(24).max(24).required(),
      from_time: Joi.string().min(4).max(4).required(),
      to_time: Joi.string().min(4).max(4).required(),
      date: Joi.date()
  };

  return Joi.validate(slot, schema);
}

module.exports = router; 