const Joi = require('@hapi/joi');
const express = require('express');
const mongoose = require('mongoose');
const slots =require('./routes/slots');
const doctors =require('./routes/doctor');
const bookings =require('./routes/booking');
const app= express();
const helmet =  require('helmet');
const compression =  require('compression');


mongoose.connect('mongodb://localhost/playground', { useNewUrlParser: true })
.then(()=>console.log("connect to mongo db"))
.catch(()=>console.error("could not connect"))

app.use(express.json());
app.use('/api/slots', slots);
app.use('/api/doctors', doctors);
app.use('/api/bookings', bookings);
app.use(express.urlencoded({ extended : true }));
app.use(helmet());
app.use(compression());
app.use(function (req, res, next) {
   
    res.setHeader('Access-Control-Allow-Origin', '*');

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    res.setHeader('Access-Control-Allow-Credentials', true);

    next();
});

const port = process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`listenting to port ${port}`);
});
