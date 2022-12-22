const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({

    title:{
        type : String,
        trim : true,//it will remove leading and trailing spaces..
        required : [true ,'Please add a course title']
    },
    description:{
        type : String,
        required : [true ,'Please add a Description']
    },
    weeks:{
        type : String,
        required : [true ,'Please add number of weeks']
    },
    tuition:{
        type : Number,
        required : [true ,'Please add a tuition cost']
    },
    minimumSkill:{
        type:String,
        required:[true,'Please add a minimum skill'],
        enum:['beginner','intermediate','advanced']
    },
    scholarshipAvailable:{
        type : Boolean,
        default : false
    },
    createdAt:{
        type : Date,
        default : Date.now
    },
    bootcamp:{
        type : mongoose.Schema.ObjectId,
        ref : 'Bootcamp',
        required : true
    },//every course is associated with some specific Bootcamp.so this relation ship we provide here by adding Bootcamp id in course..so that we idenfiy that this course belongs to this bootcamp
    user:{
        type : mongoose.Schema.ObjectId,
        ref  : 'User',
        required : true
    }
});

//now we are going to create(define) static method like in java using static keyword(to get avg course tuitions)..aggregate return promise that why getAverage fun is async declared
CourseSchema.statics.getAverageCost = async function(bootcampId){

    //console.log('Calculating average cost ...'.blue);

    //here this refer to the instance or object of current model(Course obj = new Course()) and obj.aggregate([])..refer mongoose aggregate documentation..th 
    const obj = await this.aggregate([
        {
            $match : { bootcamp : bootcampId} //here bootcamp is field here and bootcampId is argument passed in function while calling
        },
        {
            $group :{
                _id : '$bootcamp',
                averageCost : { $avg :'$tuition'}
            }
        }
    ]);
    //console.log('Object after average',obj);
    //here we actually put average cost in Bootcamp model..difference bw update and create is that update check if field is presnt or not if not then it create field with new specified value but in case of PUT we need existing field and it actually does updation only 
    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId , {
            averageCost : Math.ceil(obj[0].averageCost /10) * 10
        })
    } catch (error) {
        console.log(error);
    }
}

//what is average? avg =sum(n1+n2 +...n)/number of n...so we calculate average cost if first course added with amount(tuition) that time
//Call getAverageCost after save
CourseSchema.post('save' ,function(){

    //syntax to call static method
    this.constructor.getAverageCost(this.bootcamp);//here we pass this.bootcamp i.e the field contain bootcamp Id
});

//Call getAverageCost before remove..because if any course remove then again calcualte average
CourseSchema.pre('remove' ,function(){
    //calculate average cost before remove course
    this.constructor.getAverageCost(this.bootcamp);
})

module.exports = mongoose.model('Course' ,CourseSchema);