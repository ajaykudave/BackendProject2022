const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const crypto   = require('crypto');//core module of node to generate token and hash that token 
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
        select      : false //by set false..means when we fetch user details or any time when we got User details response it will display all data except password.
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

    if(!this.isModified('password')){
        next(); // this will call controller forget Passowrd method means it perform functionality inside forgetpassword..i.e save the document means at the time of User Creation And Updation this will not executed
    }

    const salt = await bcrypt.genSalt(10)// generate a salt(gensalt method (asynchronous)return an salt that why we use await)
    this.password = await bcrypt.hash(this.password , salt);//generating a hash(ciphertext or encrypted value) using hash method
    //the above line only run when password is modified
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
    //compare method internally convert provided plaintext to hash and then compare it with hash password store in db at the time of registration
}

//To Generate And Hash password token(it also called on Object not on class..we can say it is non static method)
UserSchema.methods.getResetPasswordToken = function(){

    //Generate Token 
    const resetToken = crypto.randomBytes(20).toString('hex'); //toString()Decodes buffer to a string according to the specified character encoding inencoding.
    console.log('random bytes without string' ,crypto.randomBytes(20));//return bytes value in buffer(it contains Binary value)

    //after that add that token(make it unreadable i.ehash) to field resetpasswordtoken 
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    //create hash method uses sha256 algorithm to encrypt reset token pass in update and digest mean after completing that it should be hexadecimal value

    //set token expire(10 min) we have ten minutes to reset our password ..we need to sent an email with this token ..like we sent otp to forget password
    this.resetPasswordExpire =  Date.now() + 10 * 60 * 1000;
    return resetToken; //without hash (not hash version)
}

module.exports = mongoose.model('User' , UserSchema);