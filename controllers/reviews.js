const ErrorResponse = require('../utils/errorResponse.js');
const asyncHandler = require('../middlewares/async.js');
const Review = require('../models/Review.js');
const Bootcamp = require('../models/Bootcamp.js');


//@Desc     Get All or Specific Reviews
//@route    GET and api/v1/reviews --All review
//@route    GET and api/v1/bootcamps/:bootcampId/reviews --review of specific Bootcamp by specifying BootcampId(i.e when we need to check review of specific course so we can do it by providing BootcampId )
//@access   Public
exports.getReviews = asyncHandler( async (req , res , next)=>{

    //If Bootcamp(Single by specifying BootcampId) exists then return data
    if(req.params.bootcampId){
        const reviews = await Review.find({ bootcamp : req.params.bootcampId });

        return res.status(200).json({
            success : true,
            count : reviews.length,
            data : reviews
        })
    }
    else{
        res.status(200).json(res.advancedResults);
    }
});

//@desc     Get a single Review (By Specifying Review Id) And in Above method we check review of specific course(provided by Bootcamp so in that case we need to provide Bootcamp Id)
//@route    /api/v1/reviews/:reviewId
//@access   Public(same like we check reviews of any products on amazon or flipkart even before buy any product..Therefore it s Public route..any one can access)
exports.getReview = asyncHandler( async (req , res , next)=>{

    console.log('Review id..',req.params.reviewId);
    const review = await Review.findById(req.params.reviewId).populate({
        path : 'bootcamp',
        select : 'name , description'
    });

    //if no review found then show error
    if(!review){
       return next(new ErrorResponse(`No review found with the id of ${req.params.reviewId}` , 404));
    }
    res.status(200).json({
        success : true,
        count : review.length,
        data : review
    })
})

//@desc     Add a Review for Bootcamp
//@route    POST and /api/v1/bootcamps/:bootcampId/reviews
//@access   Private(Because Person should logged in User) also we need to provide functionality so that User can provide one review per Bootcamp ..so no multiple review by same user..for that we need to add Index in Review Model
exports.addReview = asyncHandler(async (req , res , next)=>{

    //same like we do in Course add..basically we need to provide review for Bootcamp so that we need to first assign value to Bootcamp field in review with BootcampId got from Url(req.params.BootcampId) then also we need to assign user field with value got from auth middleware(req.user.id)

    req.body.bootcamp = req.params.bootcampId;
    req.body.user     = req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId)

    //now check whether that bootcamp exist or not if exists then only we provide an review
    if(!bootcamp){
        console.log('No Boootcamp exists');
        return next(new ErrorResponse(`No Bootcamp with id of ${req.params.bootcampId}` , 404));
    }

    //exists
    const review = await Review.create(req.body);

    res.status(201).json({
        success : true,
        data : review,
        message : 'Review added Successfully.!'
    })
});

//@desc     Update a Review 
//@route    PUT and /api/v1/reviews/:reviewId
//@access   Private(Only logged in user can access..not all(i.e public))
exports.updateReview = asyncHandler(async (req , res , next)=>{

    let review = await Review.findById(req.params.reviewId);
    //if review exists or not check first
    if(!review){
        return next(new ErrorResponse(`No Review with the id of ${req.params.reviewId}` , 404));
    }
    
    //Make sure review Belongs to the user or user is admin
    if(review.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`The logged in User with id ${req.user.id } is Not authorized  to update the review` , 401));
    }

    review = await Review.findByIdAndUpdate(req.params.reviewId , req.body ,{
        new : true,
        runValidators : true
    });

    res.status(200).json({
        success : true,
        data : review,
        message : 'Review Updated Successfully.'
    });
})

//@desc     Delete a Review 
//@route    DELETE and /api/v1/reviews/:reviewId
//@access   Private(Only logged in user can access..not all(i.e public))
exports.deleteReview = asyncHandler(async (req , res , next)=>{

    const review = await Review.findById(req.params.reviewId);

    if(!review){
        return next(new ErrorResponse(`No Review with the id of ${req.params.reviewId}` , 404));
    }

    //Make sure that user is owner of Review or user is admin
    if(review.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`The logged in User with id ${req.user.id } is Not authorized  to delete the review` , 401));
    }

    await review.remove();//this call on document object(record)..review is object
    //await Review.findByIdAndDelete(req.params.reviewId); // this call on model
    
    res.status(200).json({
        success : true,
        data : [],
        message : 'Review deleted Successfully.'
    })

})