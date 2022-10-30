//these are middleware functions(Route Handlers or controllers)
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');

const Bootcamp = require('../models/Bootcamp.js'); //schema(Model) object we load here.on which we call db methods
const errorHandler = require('../utils/errorResponse');

//@desc     Get all Bootcamps
//@route    GET(method) and /api/v1/bootcamps(route) associated with the follo controller funtion
//@access   Public  
exports.getBootcamps = asyncHandler(async (req , res , next) =>{
    /* res.status(200).json({success : true, 
                msg : "show all bootcamps",
                hello : req.hello //so we retrieve here hello which we create variable in custom middleware
            }); */
  
        //fetch bootcamp from db(this method return array)
        const bootcamps = await Bootcamp.find();
        res.status(200).json({
            success : true,
            count : bootcamps.length,
            data : bootcamps
        });
 
});
//@desc     Get Bootcamps by id
//@route    GET and /api/v1/bootcamps/:id
//@access   Public
exports.getBootcampById = asyncHandler(async (req , res , next)=>{
    /*   res.status(200).json({
            success : true , msg : `Show bootcamp ${req.params.id}`
    }); */
        const bootcamp = await Bootcamp.findById(req.params.id);

        if(!bootcamp){
            // return res.status(400).json({success : false});
            console.log('Inside getBookCampById');
            return next(new ErrorResponse(`Bootcamp not found withid of ${req.params.id} `,404));
        }
        res.status(200).json({success : true ,data : bootcamp});
});

//@desc     Create Bootcamp 
//@route    POST and /api/v1/bootcamps
//@access   Private
exports.createBootcamp =asyncHandler( async (req , res , next) =>{
   /*  res.status(200).json({
        success : true, msg : 'Created new Bootcamp or data inserted'
    }); */
    //To handle unhandled Rejections(Rejection is a concept of promise) we put try catch
    
        //console.log(req.body);
        // res.status(400).json({success : false})
        const bootcamp  = await Bootcamp.create(req.body);
         res.status(201).json({
             success : true,
             data    : bootcamp
         });
    
});

//@desc     update Bootcamps by id
//@route    UPDATE and /api/v1/bootcamps/:id
//@access   Private
exports.upadteBootcamp = asyncHandler(async (req , res , next)=>{
    // res.status(200).json({success : true,msg :`Updated bootcamp of Id ${req.params.id}`});
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id , req.body , {new : true ,runValidators : true});
   
        //if id is incorrect or Bootcamp entry corrosponding to specified id is not in db And  therefore no bootcamp find is true then execute following if
        if(!bootcamp) {
            console.log('Inside if');
           // return res.status(400).json({success : false});
           return next(new ErrorResponse(`Bootcamp not found withid of ${req.params.id} `,404));
         
        }
        res.status(200).json({success : true ,data : bootcamp});
 
});

//@desc     Get Bootcamps by id
//@route    DELETE and /api/v1/bootcamps/:id
//@access   Private
exports.deleteBootcamp =asyncHandler(async (req , res , next)=>{
   /*  res.status(200).json({
        success : true, msg : `deleted bootcamp of Id ${req.params.id}`
    }); */

   
        //so findByDelete method return promise i.e bootcamp object
        const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
        console.log(bootcamp);
        if(!bootcamp){
            // return  res.status(400).json({success:false});
            return next(new ErrorResponse(`Bootcamp not found withid of ${req.params.id} `,404));
        }
        res.status(200).json({success: true , data :{}})
 
});