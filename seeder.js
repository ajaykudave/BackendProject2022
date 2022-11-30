const fs = require('fs');//for bringing json file and store in db
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

//load environment variables
dotenv.config({ path: './config/config.env'});

//load models
const Bootcamp = require('./models/Bootcamp');
const Course   = require('./models/Course');
const User     = require('./models/User');

//connect to db
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser : true,
     // useCreateIndex  : true,
     //useFindAndModify: false
     // useUnifiedTopology : true so these  useCreateIndex and useFindAndModify,..options are depricated in new  version of mongoose
 });

 //Read JSON files(bootcamps,courses,users)
 const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`,'utf8'));//fs.readFIleSync()method Synhcronously read entire content of file.synchronously means line by line(in sequence) and convert string into Object because JS works on Objects(Understand objects)

 const courses   = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`,'utf8'));

 const users     = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`,'utf8'));
 console.log(__dirname);//It is a local variable that returns the directory name of the current module. It returns the folder path of the current JavaScript file..output-- C:\Users\digvijay kishore kud\Desktop\devcamper_api

 //put or import into db
 const importData = async ()=>{

    try{
            await Bootcamp.create(bootcamps);
            await Course.create(courses); //we comment courses because now from average cost section we now able to create course from Postman rather than reading from json file of course..now section 6.2 photo upload we again uncomment this line..so that we insert data from our json file..so delete first then insert again
            await User.create(users);
            console.log('Data Imported...'.green.inverse);//message with green color
            process.exit();
    }catch(err){
        console.log(err);
    }
 };

 //delete data
 const deleteData = async ()=>{

    try{
            await Bootcamp.deleteMany();
            await Course.deleteMany();
            await User.deleteMany();
            console.log('Data Destroyed...'.red.inverse);
            process.exit();
    }catch(err){
        console.log(err);
    }
 };
//we pass argument in terminal while calling seeder as node seeder -i or -d i means import or insert and d for delete
 if(process.argv[2] === '-i'){
    //call import function
    importData();
 }else if(process.argv[2] === '-d'){

    deleteData();
 }
/*console.log(process.argv[0]);
 console.log(process.argv[1]);
 console.log(process.argv[2]);

it will return an path of executable .The `process.execPath` property returns the absolute pathname of the executable that started the Node.js process. Symbolic links, if any, are resolved

process.argv :-The process.argv property returns an array containing the command-line arguments passed when the Node.js process was launched. The first element will be execPath.  The second element will be the path to the JavaScript file being executed. The remaining elements will be any additional command-line arguments...Thats why we use process.argv[2];

and in command line type node seeder.js -i or -d...so it return -i or -d or anything place after node seeder.js

*/