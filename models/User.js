const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const jwt      = require('jsonwebtoken');
const UserSchema = new mongoose.Schema({

    name :{
        type     : String,
        required :[true ,"Please add a name"]
    },
    email :{
        type     : String,
        required : [true , "Please add an email"],
        unique   :  true,
        match    :[
             /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please add valid email'
                ]
    },
    role : {
        type    : String,
        enum    : ['user' , 'publisher'],
        default : 'user'
    },
    /* we want only 2 type of Users i.e role user(which enroll course create review) and Pubisher who are owner of Bootcamp as well as Course  ...deault role:user */
    password : {
        type        : String,
        required    : [true , "Please add a Passowrd"],
        minlength   : 6,
        select      : false
    },
    /* when we getUser through route then that time password field and its value should not return or display or select so we use select : false */
    resetPasswordToken : String,
    resetPasswordExpire : Date,
    createdAt :{
        type    : Date,
        default : Date.now  
    }
});

//Encrypt Password using bcrypt and we should save encrypted password before user register or data save in db..so we use mongoose built in middleware
UserSchema.pre('save' , async function(next){

    const salt = await bcrypt.genSalt(10)// generate a salt(gensalt method (asynchronous)return an salt that why we use await)
    
    this.password = await bcrypt.hash(this.password , salt);//generating a hash(ciphertext or encrypted value) using hash method
});

//sign JWT for authentication and return
UserSchema.methods.getSignedJwtToken = function() {
    //jwt = header + payload + signature
    const token = jwt.sign({id : this._id} , process.env.JWT_SECRET ,{expiresIn : process.env.JWT_EXPIRE});/*basically jwt's sign()method generates  a web token and it takes 3 parameters first payload(user data ) and second secret with the combination of this 2 it generates JSON WEB TOKEN and third is expires time */
    return token;
}

//user entered password check with hash password
UserSchema.methods.matchPassword = async function(userEnteredPassword){

    return await bcrypt.compare(userEnteredPassword , this.password); //this return promise( which contain true or false)

    //compare method compares userPass with hash pass bring from DB and return promise(Object ,contain true or false)
}

module.exports = mongoose.model('User' , UserSchema);