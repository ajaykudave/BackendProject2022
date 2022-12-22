const mongoose = require('mongoose');
const ReviewSchema = new mongoose.Schema({

    title:{
            type : String,
            trim : true, //it will remove leading and trailing spaces..suppose Title = " It is Awesome  ""
            required :[ true , 'Please add a title for the Review'],
            maxlength : 100
    },
    text:{
            type : String,
            required : [ true , 'Please add some text ']
    },
    rating:{
        type : Number,
        min : 1,
        max :10,
        required : [ true , 'Please add a rating between 1 to 10']
    },
    createdAt:{
        type : Date,
        default : Date.now
    },
    bootcamp:{
        type : mongoose.Schema.ObjectId,
        ref : 'Bootcamp',
        required : true
        //we add bootcamp because we need to display for which bootcamp this review is for or belonged and same
    },
    user:{
        type : mongoose.Schema.ObjectId,
        ref : 'User',
        required : true
    }
});

//we need to provide functionality so that User can provide one review per Bootcamp ..so no multiple review by same user..for that we need to add Index in Review Model
//Prevent user from submitting more than One Review per bootcamp
ReviewSchema.index({ bootcamp : 1 , user : 1} , { unique : true});

//static method to get average Rating and save that rating in bootcamp model by assigning(update) a value to avearageRating field in Bootcamp model
ReviewSchema.statics.getAverageRating =async function (bootcampId){

    const obj = await this.aggregate([
        {
            $match : { bootcamp : bootcampId} //where condition example= select avg(sal) where deptId=10; here only where cndition on next below block or object contaion actual average cal..
        },
        {
            $group :{
                _id : '$bootcamp', // we group or collect rating on basis of same bootcamp Id.if more than one review has same bootcamp id then such reviews are group and calculated avg
                averageRating : { $avg : '$rating'} //this line do avearage calculation $avg is operator use for it
            }
        }
    ]);

    try {
            await this.model('Bootcamp').findByIdAndUpdate(bootcampId , {
                averageRating : obj[0].averageRating
            });

    } catch (error) {
        
    }
};//close of getAverageRating function

//call getAverageRating function after(POST) save reviews if we save two review then only it calculate avearge
ReviewSchema.post('save' , function(){
    this.constructor.getAverageRating(this.bootcamp);//bootcamp field contaian bootcamp Id value  as we know already
})

//call getAverageRating function before(pre) remove reviews..it actually remove but when before physically remove from db before that call getAverageRating function
ReviewSchema.pre('remove' , function(){
    this.constructor.getAverageRating(this.bootcamp)
})

module.exports = mongoose.model('Review' , ReviewSchema);

