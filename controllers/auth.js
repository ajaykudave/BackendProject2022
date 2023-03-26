const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');
const User = require('../models/User.js')
const sendEmails = require('../utils/sendEmail'); //this return function and store in sendEmails variable which further act as function .


//@desc     Register user
//@route    POST(method) and /api/v1/auth/register
//@access   Public (So that everyone can register)
exports.registerUser =asyncHandler(async (req , res , next)=>{

    const { name , email , role , password} = req.body; 
    const user = await User.create({
        name,
        email,
        role,
        password
    });
    //JWT comes in piture when we using cookies once we login then after any time when i reopen same page then it showed login inside page..no need to again login  but the thing is when any who sent request to server it s actual person or hacker ..so to resolve this problem when we register first time server sent web token and that token is saved on client site inisde cookie and when we login in then that cookie check by server and it allow
    /* so here we are working on backend i.e server so we generate webtoken using jwt library and sent that token in response when user make request fro register */
   /*  const token = user.getSignedJwtToken();
    res.status(200).json({ success : true , webTokenFromServer : token}) */
    //sending token inisde cookie
    sendTokenResponse(user , res , 200 );
});

//@desc         Login User(Every time when we login we get different web tooken eveytime)
//@route        POST /api/v1/auth/login
//@access       Public (So that everyone registered User can login)
exports.login = asyncHandler(async (req , res , next)=>{

   const { email , password } = req.body; //object destructuring

   console.log('Email and password :'+email ,password);
   //first check email and password local variable contain data or not(validation) emil=undefined..!email = true
   if(!email || !password){
        console.log('Please enter email or password ,any one of the field is empty or undefined.');
        return next(new ErrorResponse("Please enter email or password ,any one of the field is empty or undefined." ,400));
   }

   //check whether entered password and email match with database email and password..i.e suppose we enterd wrong any field value then we doest not return any data (user data) from db using findOne method..i.e user = null

   const user = await User.findOne({email}).select('+password');
   console.log('User :',user);

   //we disable select password in model so we oevrrite and upadte to true for current request only..after that it false only

   //means if user variable contain null due to wrong email and password then show error :Invalid Credential
   if(!user){
        return next(new ErrorResponse("Invalid Credential" , 401));//401 means unauthorized user..user which not exits with that email id and password
   }

   //Now check if password entered by user is plain text but in DB we store password As hash string(CipherText)while registering user..so we need to create method in model which match user pass with Db pass
   const isMatch = await user.matchPassword(password);

   console.log(isMatch);
   if(!isMatch){
    //means if isMatch = fasle then !isMatch evaluate its true means password not match
    return next(new ErrorResponse("Invalid Credentials",401));

   }

   //After that if it matchPassword then give token same like at the time of register and send success
   /* const token = user.getSignedJwtToken();

    res.status(200).json({
        success            : true ,
        webTokenFromServer : token
    }) */
    sendTokenResponse(user , res , 200)
});

//@desc     Logout user / And Clear Cookie
//@route    GET /api/v1/auth/logout
//@access   Private
exports.logout = asyncHandler(async (req , res , next)=>{
    //here when we logout then cookie also get destroy..by fetch that cookie and set it to none value
    res.cookie('token' , 'none' ,{
        expires : new Date(Date.now() + 10 * 1000), //10 min
        httpOnly : true
    });

    res.status(200).json({
        success : true,
        data : {}
    })
    //step1)first login
    //step2)now sent request to fetch login user or any request to any protect route(i.e which need to first login)..so it fetch data because we have token got from server and saved either in header or cookies
    //step3)now make request to logout ourself..then it return 200 response with no data and it clear or delete token from  cookies..and note dont select bearer token in Authorization at same time..now we use token form Cookies
    //step4)Now again move to any protected route and sent request ..it will give response that you are not authorize to access this route means we are actually logout beacause token : none or undefined..when we login then we have token and if we have token then only we give access to this routes
})


//@desc     Get Current Logged In User
//@route    GET and api/v1/auth/me
//@access   Private(because of logged in User access)
exports.getMe =asyncHandler(async (req , res , next) =>{

    //const user = await User.findById(req.user.id); //we attached user(currently login ) to req object from protect middleware

    const userFromProtect = req.user;

    res.status(200).json({
        success : true,
        data : userFromProtect
    })

})
//****the forget password and reset password are related i.e in order to reset password we first need to forget password then forget password sent a link which contain reset token and that token is required in resetPassword bec we check that token with db token if match then only it allow to reset password(here authentication check i.e only the valid user can reset password)  ****

//@desc     Forget Password
//@route    POST and api/v1/auth/forgetPassword
//@access   Public 
exports.forgetPassword = asyncHandler(async (req,res,next)=>{

    const user = await User.findOne({ email : req.body.email});//find one document(record) where emailId= "value";

    //if there is no User got in db corrosponded to the specified email then show Error
    if(!user){
        return next(new ErrorResponse(`There is no such User in db corrosponds to the email ${req.body.email}`));
    }
    //if got User then bring reset token and add that value to resetPassword field in User Model(hash value)
    const resetToken = user.getResetPasswordToken();//this function is called on user model object or instance ..so it s non static function defined in model(like in class)
    console.log('reset Password token',resetToken );

    await user.save({ validateBeforeSave : false});//this will save the document with resetpassword and resetexpire value 

    //create reset Url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetPassword/${resetToken}`;

    const message = `You are recieving this email because you (or someone else) has requested the reset of a password . Please make a PUT request to: \n\n ${resetUrl}`;

    //Now call sendEmail function.
    try {
        await sendEmails({
            email : user.email,
            subject : 'Password reset token ',
            message : message
        });
        //after successfully sent ..goto mailtrap and see mail

        res.status(200).json({
        
            success : true,
            data : 'Email Send.'
        })

    } catch (error) {
        console.log(error);
        //if some error caught then remove data i,e resetPaswordToken and resetPasswordTokenExpire
        user.resetPasswordToken= undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave : false });

        return next(new ErrorResponse('Email Could not be send' , 500));
    }

   /*  res.status(200).json({
        success : true,
        data : user,
        resetToken : resetToken
    }) */
})

//****the forget password and reset password are related i.e in order to reset password we first need to forget password then forget password sent a link which contain reset token and that token is required in resetPassword bec we check that token with db token if match then only it allow to reset password(here authentication check i.e only the valid user can reset password)  ****
//@desc     Reset Password
//@route    PUT and api/v1/auth/resetPassword/:resetToken
//@access   Public 
exports.resetPassword = asyncHandler(async (req , res , next)=>{

    //first we need to take out resettoken from url and hash it because in database we store that token in hash format so after hash we match both token 
    //Get hash token
    const resetPasswordTokenValue = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

    //now we find the user where resetPasswordToken= value
    const user = await User.findOne({
        resetPasswordToken : resetPasswordTokenValue,
        resetPasswordExpire : { $gt : Date.now() },

    });//findOne find one user where resetPasswordToken=value and resetPasswordExpire=value..gt operator check that value is greater than current time because we add 10 min for token expire..here we actually mathc the current token i.e copy from forget password sent email link with the db contain resetPasswordtoken value which save in model at the time getResetPasswordToken() called from controller

    //if user not found
    if(!user){
        return next(new ErrorResponse('Invalid Token ' ,400));//bad request
    }

    //if useer got
    user.password = req.body.password ;
    user.resetPasswordToken = undefined;//once we set a new password there is no need ,this field so we need to remove therefore we initialized to undefined
    user.resetPasswordExpire = undefined;

    await user.save();//so after save we need to sent token as a response
    
    sendTokenResponse(user , res , 200);

})

//@desc     Update User Details(except password..for password update there is separate route)
//@route    PUT and /api/v1/auth/updateUserDetails
//@access   Private(Bec logged in User can only update)
exports.updateUserDetails = asyncHandler(async (req , res , next)=>{

    //we dont provide req.body directly in findbyidandUpdate method because suppose if someone accidently add password for update..so to avoid this we actually provide fields object which contain specific field and value to be update
    //so in Postman provide json object which contain fileds and value ,except password field and value

    const fieldsToUpdate ={

        name  : req.body.name,
        email : req.body.email
    };
    console.log(`Id: ${req.user.id}`);//this req.user.id got from protect..as we also check only logged in user can update details..
    const user = await User.findByIdAndUpdate(req.user.id , fieldsToUpdate ,{
        new : true,
        runValidators : true
    });
    
    res.status(200).json({
        success : true,
        data : user,
        message : "User Details Updated.!"
    })
});

//@desc     Update Password
//@route    PUT and api/v1/auth/updatePassword
//@access   Private
exports.updatePassword =asyncHandler(async (req , res , next)=>{

    //const user = await User.findById(req.user.id); this line returns User Object(Promise) details of user ,except password because in User Model we set password :{ select : false} validation..so in order fetch password also we need to specify  externally select password ..as following 
     const user = await User.findById(req.user.id).select('+password');
    console.log('!(await user.matchPassword(req.body.currentPassword)',!(await user.matchPassword(req.body.currentPassword)));
     //check if current password match wwith db encrpted password..chcek if not match..i.e false then it true
     if(!(await user.matchPassword(req.body.currentPassword))){

        return next(new ErrorResponse('Password is incorrect', 401));
     }

     //if matched then set new password to logged in user and sent token in res just like in reset password
     user.password = req.body.newPassword;
     await user.save()

     sendTokenResponse(user , res , 200);
})


//This is Helper function helps controllers function in some calculations. 
//Get token from model(by invoking getSignedJwtToken() function) and put that token into the cookie and sent that cookie to client from server side(here we define a arrow function below)
const sendTokenResponse = (user , res , statusCode) => {

    //create token
    const token = user.getSignedJwtToken();

    //creating cookie options
    const options ={

        expires : new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 *1000),
        httpOnly: true
    }
    console.log('time',Date.now());
    //httpOnly : true means this cookie should access through client side script
   // new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 *1000 we do this calculation bec we cant write 30d in cookie expire time ..so we only write 30 and calculate or specify this is  30 days (config.env file line---> JWT_COOKIE_EXPIRE=30 )

   //we want that in production mode our cookie sent in https protocol..so that we need to set secure property= true..when we set true then cookie will not shown in cookie section in postman
   if(process.env.NODE_ENV === 'production'){
         options.secure = false; //we are creating and setting property secure in options object
   }

    //this is how creating cookie and sending in response is same time..res.cookie(name,val,cookieOptions)
    res
        .status(statusCode)
        .cookie('token' , token , options)
        .json({
            success : true,
            webTokenFromServer : token
        })
        //in order to view cookie same like we go to inside brower cookie section same in postaman we need to travel in cookie section..where cookie is present

        /* why we use cookie for storing Web token?
        ans- Storing a web token in local storage is not good due to security issue..so storing in cookie is better than storing in a local Storage */
}
