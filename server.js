//this file is entry point of our project server
const express = require('express'); //function we import here in refernce express

//Load env variables
const dotenv  = require('dotenv');

//load route files here by path
const bootcamps = require('./routes/bootcamps.js');
const courses   = require('./routes/courses.js');
const auth      = require('./routes/auth.js');

/* const logger = require('./middlewares/loggers.js');
so currently we use morgan logger(external)..this commented is our own custom logger
*/

//morgan logger middleware function
const morgan = require('morgan');

//express fileupload middleware for fileupload 
const fileupload = require('express-fileupload');
const path       = require('path');

//for generting cookie..this middleware return a function.so after cookieParser() round bracket added
const cookieParser = require('cookie-parser');

//colors
const colors = require('colors');
//customErrorHandler
const errorHandler = require('./middlewares/error.js');

//now the require with specified path return the function and it store in reference variable connectDB
const connectDB = require('./config/db.js');


//in order to use that variable we need to load that config .env file using dotenv or by defination dotenv.config() will load .env file into process.env ..that why we use process.env to access environment variables
dotenv.config({ path : './config/config.env'});
//console.log(process.env.PORT);

//Connect to db by calling function
connectDB();

const app = express(); /*initialize our app to express (web framwork) means we use express through app refernec */

//Body Parser(middleware)which is come with express installation nowdays..In order to read JSon data got from Front end and fetch using req.body...if we not specify below line then in req.body is undefined
app.use(express.json());

//logging middleware(morgan) only in development environment
app.use(cookieParser()); //i forget to put round bracket front of middleware funtion.(cookieParser)so due to this i am unable to call route..and In postman all request are in sending state continuously ..no response 

/* app.use(cookieParser); */
 
//In order to use middleware 
/* app.use(logger); */

if(process.env.NODE_ENV === 'development')
{
    app.use(morgan('dev'));//so morgan internally do console.log()which we does in custom logger
}

//we use here because before request come to server we need to first use this functionality after that if any route request come then chnages(result) comes in piture..suppose addition =a+b after that we print addi then we get perfect result..but suppose we print addition result even before result was not prepare...so keep in mind this
app.use(fileupload());

app.use(express.static(path.join(__dirname , 'public')))//static is built in express middleware function which serves static files..we setting public as static folder.
//console.log(__dirname);//It is a local variable that returns the directory name of the current module. It returns the folder path of the current JavaScript file ..output-- C:\Users\digvijay kishore kud\Desktop\devcamper_api

/* app.use(cookieParser); */

//mounts routers(when we call a request from postman it first come here)
app.use('/api/v1/bootcamps' , bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);

//calling or using errorHandler
app.use(errorHandler);

//we fetch port from .env file using (process is an object of nodejs)
const PORT = process.env.PORT || 5000 ;
const server = app.listen(PORT , console.log(`Server running on ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));

process.on('unhandledRejection' ,(err , promise)=>{
    console.log(`Error : ${err.message}`.red);
    console.log('Inside server event');
    console.log(err);
    //server close
    server.close(()=> process.exit(1));
});

//***FLOW  OF CONTROL***[so whenever we call any route from postman it first come to server then --control go to route file --then controller method--then middleware nd middleware return some response back to controller..and end to controller] and if we use some our own custom middleware then those middleware first called( like advanceResult) and then controller called...so this sequence of call is specify in route file while defining a route..
/* eg.
router
.route('/')
.get(advancedResults(Bootcamp,'courses'),getBootcamps)
.post(createBootcamp); 

advanceResults() its middleware and getBootcamps is controller name
*/