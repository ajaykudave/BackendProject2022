const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');

const Course = require('../models/Course.js'); //schema(Model) object we load here.on which we call db methods
const Bootcamp = require('../models/Bootcamp.js');


//@desc     Get all Courses or Cousres of specified bootcamp
//@route    GET(method) and /api/v1/courses
//@route    GET(method) and /api/v1/bootcamps/:bootcampId/courses
//@access   Public 
exports.getCourses = asyncHandler(async (req,res,next)=>{

    let query;
    //req.params--check in url :value eg :1234
    console.log(req.params.bootcampId);
    if(req.params.bootcampId){

       /*  query =Course.find({bootcamp :req.params.bootcampId}).populate({
            path : 'bootcamp',
            select : 'name description'
        }); */
        query =Course.find({bootcamp :req.params.bootcampId});
    }else{
      /*   query = Course.find().populate('bootcamp'); In the argument of the populate() method we pass the field we want to populate with the user data. bootcamp is field in Course model..so populate methode use its value and get data

        as we see when we get all courses we get all details of course with bootcamp id associated with it ..But we now want that instead of bootcamp id our who bootcamp data also populate with courses data..so we use populate() and this happen bec Bootcamp id (primaray key is foreign key in Courses Schema) */
        query = Course.find().populate({
            path : 'bootcamp',
            select : 'name description'
        }); //suppose instead of show or populate all Bootcamp details we want  only few details to be populate so pass object

        /* also there is reverse populate .i.e for each bootcamp we want to show their provided courses list..so for that we need reverse populate using virtual (bec each bootcamp has multiple courses(One to Many.) but each Course doesnot have multiple Bootcamp) ..for this we need to change in Bootcamp controller and model file*/
    }

    const courses = await query;
    console.log('count:',courses.length);

    res.status(200).json({
        success : true ,
        count : courses.length,
        data : courses
    });
});

//@desc     Get a single Course
//@route    Get /api/v1/courses/:id
//@access   Public
exports.getCourse = asyncHandler(async (req,res,next)=>{
    console.log('Inside getCourse Method(course Id is:)',req.params.courseId);
    const course = await Course.findById(req.params.courseId).populate({
        path : 'bootcamp',
        select : 'name description'
    });

    if(!course){

        return next(new ErrorResponse(`No Course found with id ${req.params.id}`,404));
    }
    res.status(200).json({
        success : true,
        data : course
    })

});

//@desc      Add a New Course
//@route     /api/v1/bootcamps/:bootcampId/courses
//@access    Private
exports.addCourse =asyncHandler(async (req,res,next)=>{

    req.body.bootcamp = req.params.bootcampId; //as we know in course model there is bootcamp field(forign key) so we assign that bootcamp field by taking out bootcampId from Postman specified in url post request(/api/v1/bootcamps/:bootcampId/courses)

    const bootcamp = await Bootcamp.findById(req.params.bootcampId) //..here bootcampId the name is specified in route and it should match with here also bec at the time of adding course we first specify the url request and hence it first go into the route file then controller file 

    //as we know that Course provided by Institute(Bootcamps) so we first check that such bootcamp is presnt or not in db if not then go into if block and throw error
    if(!bootcamp)
    {
        return next(new ErrorResponse(`No Bootcamp found with id ${req.params.bootcampId}`,404));
    }
    const course = await Course.create(req.body); //req.body =req.body.bootcamp +req.body
    res.status(201).json({success : true,data : course});
});

//@desc     Update the Course by specifying courseId
//@route    /api/v1/courses/:courseId
//@access   Private
exports.updateCourse =asyncHandler(async (req,res,next)=>{

    let course = await Course.findById(req.params.courseId);

    //if we put incorrect id and we know we unable to get bootcamp with incorrect id so findById return undefined
    if(!course){

        return new ErrorResponse(`Course not found with id ${req.params.courseId}`,404);
    }
    
    course = await Course.findByIdAndUpdate(req.params.courseId ,req.body,{new : true,
    runValidators : true});

    res.status(200).json({success : true , data : course});

});

//@desc     Delete a Course by Specifying id
//@route    /api/v1/courses/:courseId
//@access   Private
exports.deleteCourse =asyncHandler(async (req,res,next)=>{

    const course = await Course.findById(req.params.courseId);
    if(!course){

        return new ErrorResponse(`Course not found with id ${req.params.courseId}`,404);
    }
   await course.remove();
   res.status(200).json({
    success : true,
    data    :  {}
    });
});
