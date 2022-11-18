//this file is entry point of our project server
const express = require('express'); //function we import here in refernce express

//Load env variables
const dotenv  = require('dotenv');

//load route files here by path
const bootcamps = require('./routes/bootcamps.js');
const courses   = require('./routes/courses.js');

/* const logger = require('./middlewares/loggers.js');
so currently we use morgan logger(external)..this commented is our own custom logger
*/

//morgan logger middleware function
const morgan = require('morgan');

//express fileupload middleware for fileupload 
const fileupload = require('express-fileupload');
const path       = require('path');

//colors
const colors = require('colors');
//customErrorHandler
const errorHandler = require('./middlewares/error.js');

//now the require with specified path return the function and it store in reference variable connectDB
const connectDB = require('./config/db.js');


//in order to use that variable we need to load that config .env file using dotenv 
dotenv.config({ path : './config/config.env'});

//Connect to db by calling function
connectDB();

const app = express(); /*initialize our app to express (web framwork) means we use express through app refernec */

//Body Parser(middleware)which is come with express installation nowdays..In order to read JSon data got from Front end and fetch using req.body...if we not specify below line then in req.body is undefined
app.use(express.json());
 
//In order to use middleware 
/* app.use(logger); */

//logging middleware(morgan) only in development environment
if(process.env.NODE_ENV === 'development')
{
    app.use(morgan('dev'));//so morgan internally do console.log()which we does in custom logger
}

//we use here because before request come to server we need to first use this functionality after that if any route request come then chnages(result) comes in piture..suppose addition =a+b after that we print addi then we get perfect result..but suppose we print addition result even before result was not prepare...so keep in mind this
app.use(fileupload());

app.use(express.static(path.join(__dirname , 'public')))//static is built in express middleware function which serves static files..we setting public as static folder.
//console.log(__dirname);//It is a local variable that returns the directory name of the current module. It returns the folder path of the current JavaScript file ..output-- C:\Users\digvijay kishore kud\Desktop\devcamper_api

//mounts routers(when we call a request from postman it first come here)
app.use('/api/v1/bootcamps' , bootcamps);
app.use('/api/v1/courses', courses)

//calling or using errorHandler
app.use(errorHandler);

//we fetch port from .env file using (process is an object of nodejs)
const PORT = process.env.PORT || 5000 ;
const server = app.listen(PORT , console.log(`Server running on ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));

process.on('unhandledRejection' ,(err , promise)=>{
    console.log(`Error : ${err.message}`.red);
    console.log('Inside server event');
    // console.log(err);
    //server close
    server.close(()=> process.exit(1));
})