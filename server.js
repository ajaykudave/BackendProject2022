//this file is entry point of our project server
const express = require('express');
const dotenv  = require('dotenv');

//in order to use that variable we need to load that config .env file using dotenv 
dotenv.config({ path : './config/config.env'});

const app = express(); //initialize our app to express (web framwork) means we use express through app refernec

//we fetch port from .env file using (process is an object of nodejs)
const PORT = process.env.PORT || 5000 ;
app.listen(PORT , console.log(`Server running on ${process.env.NODE_ENV} mode on port ${PORT}`));