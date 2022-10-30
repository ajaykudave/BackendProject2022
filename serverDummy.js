//this file is entry point of our project server
const express = require('express');
const dotenv  = require('dotenv');

//in order to use that variable we need to load that config .env file using dotenv 
dotenv.config({ path : './config/config.env'});

const app = express(); /*initialize our app to express (web framwork) means we use express through app refernec */

//making routes
app.get('/' ,(req ,res)=>{
  /*   res.send({
        id : 1, text:'Its JS Object'
    });  */
    //res.json({name : 'Ajay'});
   // res.sendStatus(400);
   res.status(400).json({success : false , data : null});
});






//we fetch port from .env file using (process is an object of nodejs)
/* const PORT = process.env.PORT || 5000 ;
app.listen(PORT , console.log(`Server running on ${process.env.NODE_ENV} mode on port ${PORT}`)); */

/* making routes

app.get('/api/v1/bootcamps' ,(req ,res)=>{
  
    res.status(200).json({success : true, msg : "show all bootcamps"});
});
//get bootcamp by id if id =1 from db
app.get('/api/v1/bootcamps/:id' ,(req,res)=>{

    res.status(200).json({
        success : true , msg : `Show bootcamp ${req.params.id}`
    });
});

//route for post
app.post('/api/v1/bootcamps',(req,res)=>{
    res.status(200).json({
        success : true, msg : 'Created new Bootcamp or data inserted'
    });
});
//update route
app.put('/api/v1/bootcamps/:id',(req,res)=>{
    res.status(200).json({success : true,msg :`Updated bootcamp of Id ${req.params.id}`});
});
//delete route
app.delete('/api/v1/bootcamps/:id' , (req,res)=>{
    res.status(200).json({
        success : true, msg : `deleted bootcamp of Id ${req.params.id}`
    })
})

*/

/* 
CASE 4) server with neat clean code...we separate routes and function(middleware ) for that specific route

    //this file is entry point of our project server
const express = require('express'); //function we import here in refernce express
const dotenv  = require('dotenv');

//load route files here by path
const bootcamps = require('./routes/bootcamps.js');


//in order to use that variable we need to load that config .env file using dotenv 
dotenv.config({ path : './config/config.env'});

const app = express(); /*initialize our app to express (web framwork) means we use express through app refernec *



//mounts routers(when we call a request from postman it first come here)
app.use('/api/v1/bootcamps' , bootcamps);


//we fetch port from .env file using (process is an object of nodejs)
const PORT = process.env.PORT || 5000 ;
app.listen(PORT , console.log(`Server running on ${process.env.NODE_ENV} mode on port ${PORT}`));
*/

/* set up middleware function

//Now we are going to setup custom middleware function
const logger = (req ,res ,next)=>{
    req.hello = 'Hello World';
    console.log('Middleware ran');
    next();//in every middleware there is we need to add next().so it moves control next middleware function
}

//In order to use middleware 
app.use(logger);
*/

