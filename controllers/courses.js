const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');

const Course = require('../models/Course.js'); //schema(Model) object we load here.on which we call db methods
const Bootcamp = require('../models/Bootcamp.js');


//@desc     Get all Courses or Cousres of specified bootcamp
//@route    GET(method) and /api/v1/courses
//@route    GET(method) and /api/v1/bootcamps/:bootcampId/courses
//@access   Public 
exports.getCourses = asyncHandler(async (req,res,next)=>{

    //req.params--check in url :value eg :1234
    console.log(req.params.bootcampId);
    if(req.params.bootcampId){

       const courses =await Course.find({bootcamp :req.params.bootcampId});//we find all courses where bootcampId=vlaue ..we pass object
        //query =Course.find(req.params.bootcampId);//this also work

        //if course of specific bootcamp so directly return response no need pagination here
        return res.status(200).json({
            success : true,
            count : courses.length,
            data : courses
        });

    }else{
      /*   query = Course.find().populate('bootcamp'); In the argument of the populate() method we pass the field we want to populate with the user data. bootcamp is field in Course model..so populate methode use its value and get data

        as we see when we get all courses we get all details of course with bootcamp id associated with it ..But we now want that instead of bootcamp id our who bootcamp data also populate with courses data..so we use populate() and this happen bec Bootcamp id (primaray key is foreign key in Courses Schema) 
        query = Course.find().populate({
            path : 'bootcamp',
            select : 'name description'
        }); */ 
        //suppose instead of show or populate all Bootcamp details we want  only few details to be populate so pass object

        /* also there is reverse populate .i.e for each bootcamp we want to show their provided courses list..so for that we need reverse populate using virtual (bec each bootcamp has multiple courses(One to Many.) but each Course doesnot have multiple Bootcamp) ..for this we need to change in Bootcamp controller and model file*/
        //for all courses we use pagination
        res.status(200).json(res.advancedResults);
    }

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
//@route     POST(method) /api/v1/bootcamps/:bootcampId/courses
//@access    Private
exports.addCourse =asyncHandler(async (req,res,next)=>{

    req.body.bootcamp = req.params.bootcampId; //as we know in course model there is bootcamp field(forign key) so we assign that bootcamp field by taking out bootcampId from Postman, specified in url post request(/api/v1/bootcamps/:bootcampId/courses)

    //for Course Ownership
    req.body.user = req.user.id //this line add user property with value in body 

    const bootcamp = await Bootcamp.findById(req.params.bootcampId) //..here bootcampId the name is specified in route and it should match with here also bec at the time of adding course we first specify the url request and hence it first go into the route file then controller file 

    //as we know that Course provided by Institute(Bootcamps) so we first check that such bootcamp is presnt or not in db if not then go into if block and throw error
    if(!bootcamp)
    {
        return next(new ErrorResponse(`No Bootcamp found with id ${req.params.bootcampId}`,404));
    }

    //Make sure adding a course is owner of a Bootcamp Because Courses added by the Bootcamp ownwer or admin only
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`The logged in user with id ${req.user.id} is not authorize to add a Course to the Bootcamp or not an admin`));
    }

    //else authorize user (logged in User i.e Owner of the Bootcamp) can add course
    const course = await Course.create(req.body); //req.body = req.body + req.body.bootcamp
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
    
    //Make sure that user try to update is owner of a Bootcamp Because Courses updated by the Course ownwer or admin only..If not following error will return inside if Statment Now this time we take (course.user.toString) instead of (bootcamp.user.toString)..after adding column user in addCourse now user column availabe in for all to updaet delete
    if(course.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`The logged in user with id ${req.user.id} is not authorize to update a Course with Course id ${course.id} or not an admin`));
    }

    course = await Course.findByIdAndUpdate(req.params.courseId ,req.body,{new : true,
    runValidators : true});

    res.status(200).json({success : true , data : course});

});

//@desc     Delete a Course by Specifying id
//@route    DELETE(method) /api/v1/courses/:courseId
//@access   Private
exports.deleteCourse =asyncHandler(async (req,res,next)=>{

    const course = await Course.findById(req.params.courseId);
    if(!course){

        return new ErrorResponse(`Course not found with id ${req.params.courseId}`,404);
    }

     //Make sure that user try to update is owner of a Bootcamp Because Courses added by the Bootcamp ownwer or admin only..If not following error will return inside if Statment Now this time we take (course.user.toString) instead of (bootcamp.user.toString)..after adding column user in addCourse now user column availabe in for all to updaet delete
     if(course.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`The logged in user with id ${req.user.id} is not authorize to update a Course with Course id ${course.id} or not an admin`));
    }
   await course.remove();
   res.status(200).json({
    success : true,
    data    :  {}
    });
});
