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
    /* res.status(200).json({success : true, 
                msg : "show all bootcamps",
                hello : req.hello //so we retrieve here hello which we create variable in custom middleware
            }); */
            let query;

            //now we are going to create our req.query for that we need to use spread opertor
            const reqQuery = {...req.query };//we copy all express req.query properties into our local variable
            //so we get that query parameters here passed from postman using express req.query 
           // let queryStr = JSON.stringify(req.query);

           const removeFields = ['select','sort','page','limit'];//array

           //Loop over removeFields array and delete select from reqQuery
           removeFields.forEach((params) => delete reqQuery[params]);

            let queryStr = JSON.stringify(reqQuery);

            queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g,(match)=>`$${match}`);
            //so basically we write logic to put $ sign in front of query operator operator..eg..$gt
            //lte,gt these are mongoose operators and \b is word boundry character


             /* also there is reverse populate .i.e for each bootcamp we want to show their provided courses list..so for that we need reverse populate using virtual (bec each bootcamp has multiple courses(One to Many.) but each Course doesnot have multiple Bootcamp) ..for this we need to change in Bootcamp controller and model file*/
             

            console.log(queryStr);
         //fetch bootcamp from db(this method return array)
        //finding resource (bootcamps)
       /* query = Bootcamp.find(JSON.parse(queryStr)).populate({
            path : 'courses',
            select : 'title description'
        }); // reverse populate specific field with data
        */
        query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');

      //  console.log(req.query.select);
        //Select Fields
        if(req.query.select){
            const fields = req.query.select.split(',').join(' ');//join make whole array element as single string with space an return
            console.log(fields);
            query = query.select(fields);//return specified field with data
        }

        //Sort(Ascending =1  and descending = -1)
        if(req.query.sort){
            const sortBy = req.query.sort.split(',').join(' ');//join make whole array element as single string with space an return
            console.log(sortBy);
            query = query.sort(sortBy);//return specified field with data
        }else{
            //sort by default date in our model
            query = query.sort('-createdAt');
        }

        //Pagination
        const page = parseInt(req.query.page,10) || 1; //page number
        const limit = parseInt(req.query.limit,10) || 25; //number of document or record(bootcamp) should displayed on a page
        //const skip = (page - 1)* limit;
        const startIndex = (page - 1)* limit;
        const endIndex = page * limit;
        const total = await Bootcamp.countDocuments();


        query = query.skip(startIndex).limit(limit);

        //executing query
        const bootcamps = await query;

        //Pagination Result
        const pagination = {}; //blank Object
        
        if(endIndex < total){
            pagination.next ={
                page : page + 1,
                limit :limit
            }
        }

        if(startIndex > 0){
            pagination.pre = {
                page : page - 1,
                limit :limit //if we add only limit i.e that also fine because value also limit 
            }
        }

        //response to front
        res.status(200).json({
            success : true,
            count : bootcamps.length,
            pagination:pagination,  //if key : value are same then we can add only key ..it works
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