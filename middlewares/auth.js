
const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

//Protect routes we write a function..basically this function is to validate the token sent from server at the time of login user..so this function validate that ony login user that ony do the creation of Bootcamp create course..etc
//so here we extract the id from token (basically it checks whether it valid User or not through token sent at the time of login) also we get know that ,we has to login first then go to further routes
exports.protect = asyncHandler(async(req , res , next) =>{

    /* Note there is 2 ways to get token --1)from bearer token 2)cookies..Use one of them either and comment out one part..so i comment out else part cookies */
    let token;

    let authorization = req.headers.authorization; // so this auhorization and Authorization are same..this will automatically added to the Postman Header Section tab(this are hidden)..click on hidden above the Header tab..previously we add manually but now using environment variable this will set automatically when we hit request
    if(authorization && authorization.startsWith('Bearer')){
        console.log('Inside auth--',authorization);
        token = authorization.split(' ')[1]; //req.headers.authorization=Bearer <token>.. ,we get token from second position ..split method split string by space and store it in an array..therefore [1]
        //eg. String authorization =" bearer <token value>";//after split it will convert string into an array of strings
        //authorization =["bearer" , "<token>"];therefore [1]
    }//the same above task can be achieved by cookies..if we got token from server then that we also get from cookie beasue we also add functinality that store token inside cookies..so we get token from cookie even if authorization is not selected bearer token..so in that time it come to else part and check req.cookies.token if true then set token =  token
   /*  else if(req.cookies.token)
    {
        token = req.cookies.token;

        //it first check if condition if it false then it check else
        //so when we login the token sent and save in cookie part(in postman )same like in browser..bec postman acts as our client or browser and it attached to every request..i.e every protected request get,update ,delete they use token from cookie..no need to select bearer token in Authorization tab or menu
    } */
    /* IF WE WANT to take out token from Authorization header then comment out else part of cookies */

    //now validate token that actual token that sent at the time of login to user..if it got token then only he /she do further operation in application..like when we got OTP then only we proceed transaction
    if(!token){
        return next(new ErrorResponse("Not Authorized to access this route(Because token = undefined) means check whether you select token in Authorization tab(select bearer token)" , 401));
    }
    
    //if token variable contains any data
    try{

        //verify token
        const decoded = jwt.verify(token , process.env.JWT_SECRET); // this function verify token by secret and return payload..payload object look in token
        /*  {
            "id": "637f7ed9505957648007b068",
            "iat": 1669363467,
            "exp": 1671955467
          } */
        console.log('Decoded',decoded);

        //extract user id from token and pass into func and return that currectly login user i.e user data
        req.user = await User.findById(decoded.id); //decoded contain payload object therfore we write decoded.id..so it find that specified id User and attached that req.user=data
        next();//this next we transfer control and call to controllers method

    }catch(err){
        return next(new ErrorResponse("Not Authorized to access this route(Because token = undefined) means token modified" , 401));
    }

})
//so to use this we need to pass it to route whicever route we want..so wherever we need to check login..means when we login in then only i can upload photo ,create,update,delete things..so in such route put this protect middleware function first parameter

//****so before authorize user..once we login we get web token and then any user role perform CRUD operation but In our projcet ONLY ADMIN and PUBLISHER user role perform CRUD operation***
exports.authorize = (...roles)=> {

    //returning method
    return (req ,res ,next) =>{

         //req.user got from above method..after that method(i.e login) we check user roles..each USER model have role property..therfore req.user.role
        if(!roles.includes(req.user.role))
        {
             return next(new ErrorResponse(`User Role ${req.user.role} unauthorized to acccess this route` , 403));//403 forbidden error
        }
        next();//this will call controller method with here req,res ojects
        //example..delete(protect , authorize('publisher' , 'admin') , deleteBootcamp)..here we can see after protect call complete it also contain next() this next will attched req,res objects and transfer to authorize funtion ..same authorize call and trasfer control to deleteBootcamp
    }
   
}
//in above function we use spread opeator because roles it contain more than one argument..i.e that function when we call then that time we pass 2 argument so we dont need to remember how many argument only we write ... dots and variable name then that contain that values like array ...so in if we use includes method
