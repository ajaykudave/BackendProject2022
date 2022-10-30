const mongoose = require('mongoose');
//creating a fun contain db connection configuration so we call this function from our server
const connectDB =async () =>{

    //mongoose.connect() function return a promise so we use async and await
    const conn = await mongoose.connect(process.env.MONGO_URI, {
       useNewUrlParser : true,
        // useCreateIndex  : true,
        //useFindAndModify: false
        // useUnifiedTopology : true so these  useCreateIndex and useFindAndModify,..options are depricated in new  version of mongoose
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
}

//to use this function outside we need to export it first
module.exports = connectDB;