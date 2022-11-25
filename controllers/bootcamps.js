const path = require('path');//this for file upload extension(eg .jpg,.png etc)..to generate original file ext
//these are middleware functions(Route Handlers or controllers)
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');

const Bootcamp = require('../models/Bootcamp.js'); //schema(Model) object we load here.on which we call db methods
//const errorHandler = require('../utils/errorResponse');
const geocoder = require('../utils/geoCoder');

//@desc     Get all Bootcamps
//@route    GET(method) and /api/v1/bootcamps(route) associated with the follo controller funtion
//@access   Public  
exports.getBootcamps = asyncHandler(async (req , res , next) =>{

        //***FLOW  OF CONTROL***[so whenever we call any route from postman it first come to server then --control go to route file --then middleware we pass next so it pass control to controller --and after that controller method give response..and end to controller]
           
        //response to front
       /*  res.status(200).json({
            success : true,
            count : bootcamps.length,
            pagination:pagination,  //if key : value are same then we can add only key ..it works
            data : bootcamps
        }); */
        res.status(200).json(res.advancedResults); //here we call an object advanceResults which is inside res object ..therefore we call like this..res.advanceResults
        /*   eg. res ={
            advancedResults = {
                
            }
        } */
 
});
//@desc     Get Bootcamps by id
//@route    GET and /api/v1/bootcamps/:id
//@access   Public
exports.getBootcampById = asyncHandler(async (req , res , next)=>{
    /*   res.status(200).json({
            success : true , msg : `Show bootcamp ${req.params.id}`
    }); */
        const bootcamp = await Bootcamp.findById(req.params.bootcampId);

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
        console.log(`Currently login User: ${req.user.name}`)
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
   console.log(`Currently Login User ${req.user.name}`);
     let bootcamp = await Bootcamp.findById(req.params.bootcampId); //we first check whether that particular bootcamp is present or not if id incorrect then it will return undefined and its true and we got an error in if block
    //if id is incorrect or Bootcamp entry corrosponding to specified id is not in db And  therefore no bootcamp find is true then execute following if
        if(!bootcamp) {
            console.log('Inside if of Bootcamp Update');
           // return res.status(400).json({success : false});
           return next(new ErrorResponse(`Bootcamp not found withid of ${req.params.bootcampId} `,404));
         
        }
        //if id id correct then find by id and update
        bootcamp = await Bootcamp.findByIdAndUpdate(req.params.bootcampId , req.body , {new : true ,runValidators : true});
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
       /*  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id); */
       console.log(`Currently Login User ${req.user.name}`);
       const bootcamp = await Bootcamp.findById(req.params.bootcampId);
        console.log(bootcamp);

        if(!bootcamp){
            // return  res.status(400).json({success:false});
            return next(new ErrorResponse(`Bootcamp not found withid of ${req.params.bootcampId} `,404));
        }

        bootcamp.remove();//this change for to trigger or work call that pre middleware (delete courses)
        res.status(200).json({success: true , data :{}})
});

//@desc     Get bootcamps within a radius
//@route    GET and /api/v1/bootcamps/radius/:zipcode/:distance
//@access   Private
exports.getBootcampByRadius =asyncHandler(async (req , res , next)=>{
   
    const { zipcode , distance } = req.params;

    //Get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    //Calc radius using radius
    //Divide distance by radius of earth
    //Earth Radius = 3,963 mi /or 6,378 km

    const radiusOrZone = distance / 3963;
    console.log(radiusOrZone);

    const bootcamps = await Bootcamp.find({
        location : { $geoWithin: { $centerSphere: [ [ lng, lat ], radiusOrZone ] }}
    });
 
  res.status(200).json({
    success : true,
    count : bootcamps.length,
    data : bootcamps
  })
 });

 //upload file
 //@desc        Upload an Image for specific Bootcamp
 //@route       PUT /api/v1/bootcamps/:bootcampId/photo
 //@access      Private
 exports.uploadPhotoForBootcamp =asyncHandler(async (req,res,next)=>{

    console.log(`Currently Login User ${req.user.name}`);
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if(!bootcamp){
        return next(new ErrorResponse(`Bootcamp not found with id ${req.params.bootcampId}`),404);
    }

    //check if file not uploaded bec..it doest contain object(file)
    if(!req.files){
        return next(new ErrorResponse(`Please enter file for upload`,400));
    }
   // console.log(req.files.file);//Inside req.files there is object (file)..object inside object..and we want that inner object because that contain required keys(datas)

    const file = req.files.file; //so we assign all content or data inside file to our local file variable
   /*  const file = {...req.files.file};  both are same 
    console.log('Ajay file console',file); */
    //some validation before upload file is photo only [ mimetype: 'image/jpeg' store in express-fileupload this way]..that why in if we check condition startsWith
     if(!file.mimetype.startsWith('image')){
        //if it not start with image..i.e it s not an image so we throw error
        return next(new ErrorResponse(`Please upload(or select) image file only`,400));
    }

    //file size check validation
    if(file.size > process.env.MAX_FILE_SIZE){
        return next(new ErrorResponse(`Please upload(or select) image file of size less than ${process.env.MAX_FILE_SIZE}`,400));
    }

    //suppose someone add file with same name so we first overwrite the file name or create custom name for evrytime when any one upload image (custom name format look like => Photo_bootcampId.jpg)
    file.name =`photo_${bootcamp._id}${path.parse(file.name).ext}`;

    console.log(file.name);

    //After that move file to the particular location in our application(server)
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}` ,async (err)=>{
        if(err){
            console.log(err);
            return next(new ErrorResponse("Problem with file upload",500));
        }
        await Bootcamp.findByIdAndUpdate(req.params.bootcampId,{
            "photo":file.name
        });
        
        //response from server
        res.status(200).json({
            success : true,
            data : file.name
        })
    }) 

   


 });