//this is custom(our own implementation)error handler .
const ErrorResponse = require('../utils/errorResponse.js');
const errorHandler = (err,req,res,next) =>{

    let error = { ...err }; //we copy all err object property into our local error variable

    error.message = err.message ;
    // we log error..err is  object
    console.log('errrrrr',err); // console.log(err.stack.red)stack is property of err object
   
    //Mongoose Bad Object Id then Cast error
    if(err.name === 'CastError')
    {
        console.log('Inside CastError If Block',err.name);
        /* const message = `Bootcamp not found with id of ${err.value}`; */ 
        const message = `Resource not found with id of ${err.value}`;//we change this at the time of single review fetch..when i put wrong id eg.1 then it will be CASTERROR so it should display Review not found but it display Bootcamp not found which wrong ..so in order to work for both Review and bootcamp we write Resource not found.

        /* CAST ERROR occur when _id does not match what Mongoose expects as "format" ..when i put wrong review ,bootcamp or course id or any id then it will give cast error */

        error = new ErrorResponse(message,404);
    }

    //mongoose duplicate key 
    if(err.code === 11000){
        console.log('Inside Duplicate Key If Block');
        const message = 'Duplicate field value entered.';
        error = new ErrorResponse(message,400);
    }

    //Mongoose validation error
    if(err.name === 'ValidationError'){
        console.log('Inside ValidationError If Block',err.name);
        const message =Object.values(err.errors).map(val => val.message);
       //const message =Object.values(err.errors) this also work same as using map
        error = new ErrorResponse(message ,400);
    }

   /*  res.status(500).json({success : false, error : err.message}); */
 /*   res.status(err.statusCode || 500).json({
    success : false ,
    error : err.message || 'Server Error'
   }) */
   res.status(error.statusCode || 500).json({
    success : false ,
    error : error.message || 'Server Error'
   })
}
//export
module.exports = errorHandler;
//so whenever we import or use it using app.use so keep  in my mddleware i.e this function or this line app.use.. apply in linear manner one after one middle ware funtion then only it comes in effect unless not.