const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');
const User = require('../models/User.js')


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
})

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

