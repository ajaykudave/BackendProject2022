//Model file (MVC) ..M for Model constructing a structure which exactly build in our db or this structure(Schema..is Blueprint same like our POJO Class file) interact with db..It contains the fields

const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geoCoder.js');

//schema
const BootcampSchema = mongoose.Schema({

    //contains the fields this field we create with validation
    name : {
        type      : String,
        required  : [true ,'Please add a Name'],
        unique    : true,
        trim      : true,//it will remove leading and trailing spaces..
        maxlength : [50 , 'Name can not be more than 50 characters']
    },
    slug : String,
    description : {
        type      : String,
        required  : [true ,'Please Description a Name'],
        maxlength : [500 , 'Name can not be more than 500 characters']
    },
    website : {
        type  : String,
        match : [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/ ,
            'Please use a valid URL with HTTP or HTTPS'
        ]
    },
    phone : {
        type     : String,
       maxlength : [20, 'Phone number cannot be longer than 20 characters']
    },
    email : {
        type  : String ,
        match : [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please add valid email'
        ]
    },
    address  : {
        type     : String,
        required : [true , 'Please add an address']
    },
    location : {
        //GeoJson Point..here we store cordiantes and point 
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: false
          },
          coordinates: {
            type     : [Number],
            required : false,
            index    : '2dsphere'
          },
          formattedAddress : String,
          street : String,   
          city  : String,
          state : String,
          zipcode : String,
          country : String
           
    },
    careers : {
        //array of strings
        type : [String],
        required : true,
        enum : [
            'Web Development',
            'Mobile Development',
            'UI/UX',
            'Data Science',
            'Business',
            'Other'
        ]
    },
    averageRating : {
        type : Number,
        min  : [1,'Rating Must be atleast 1'],
        max  : [10,'Rating Must can not be more than 10']
    },
    averageCost : Number,
    photo : {
        type    : String , //name of the file
        default : 'no-photo.jpg'//when front end develop then add this image into project ,so if there is no photo added by user then by default this image will be displayed 
    },
    housing : {
        type : Boolean,
        default : false
    },
    jobAssistance : {
        type : Boolean,
        default : false
    },
    jobGuarantee : {
        type : Boolean,
        default : false
    },
    acceptGi : {
        type : Boolean,
        default : false
    },
    createdAt : {
        type : Date,
        default : Date.now //current date 
    },
    user :{
        type : mongoose.Schema.ObjectId,
        ref  : 'User',
        required : true
    }//we add user column (value is user id)so that we get to know this bootcamp owner is this user
},{
    toJSON : { virtuals: true},
    toObject : {virtuals: true}
})
//so we add here another object(here virtual course field added automatically and we add toJSON : true because it should add json data there) in schema for Virtual attribute Courses(for Reverse Populate)..this will not add column permanantly ..it only add temporarily to show on front end

//slugify (Create a Bootcamp slug from name)..like we create our own middleware ..mongoose has built in middleware..i.e .pre()..so slugify function convert Devcentral Bootcamp to devcentral-bootcamp
BootcampSchema.pre('save' , function(next){
  //  console.log('Slugify ran',this.name);
    this.slug = slugify(this.name,{lower : true})
    next();
});



//Geocoder(split the address in following fields..city,street ...so on) but this should happen before document get save into db..so in order to save that fields with data we use this pre (document middleware)..In document middleware this refer to the document(record)
BootcampSchema.pre('save' ,async function(next){

     const loc = await geocoder.geocode(this.address);
     this.location={
        type:'Point',
        coordinates:[loc[0].longitude , loc[0].latitude],
        formattedAddress:loc[0].formattedAddress,
        street:loc[0].streetName,
        city  : loc[0].city,
        state : loc[0].stateCode,
        zipcode : loc[0].zipcode,
       country : loc[0].countryCode
     }
       
     //After split we dont need that address field with data to be save in DB so we assign undefined means blank or nothing
     this.address=undefined;
    next();
  });

  //****cascade delete courses when a bootcamp is deleted(means when we delete a specifed bootcamp then all courses associated to that bootcamp also deleted from Course table in db)..simple the courses are in Bootcamp(i.e encapsulated if we destroy capsule the content inside also get deleted.) very nice and imp ****

  /* Here Document as well as Query Middleware used and executed (Query middleware executed when we use await) */
  BootcampSchema.pre('remove',async function(next){
    console.log(`Courses being removed from bootcamp ${this._id}`);
    //we use async bec we call delete asynchronous method and that return promise

    await this.model('Course').deleteMany({ bootcamp : this._id});//here Query middle ware called
    //similar to await Course.deleteMany(); obj.method() in java

    //this will not work on findByIdAndDelete method
  })


  //Reverse Populate using virtuals(field name,{options})..field name means column name eg.courses
    BootcampSchema.virtual('courses',{
        ref : 'Course',//model name
        localField : '_id', //current model id(Bootcamp)
        foreignField : 'bootcamp' ,//foreign field in Course MOdel
        justOne : false //by default this is false that it populate virtual with array.. If we set justOne:true, the populated virtual will be a single doc or null.
    });


//export 
module.exports = mongoose.model('Bootcamp',BootcampSchema);//firs argument in model() is collection name(table name),second is schema