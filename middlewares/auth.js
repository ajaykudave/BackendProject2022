
const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

//Protect routes we write a function..basically this function is to validate the token sent from server at the time of login user..so this function validate that ony login user that ony do the creation of Bootcamp create course..etc
//so here we extract the id from token (basically it checks whether it valid User or not through token sent at the time of login) also we get know that ,we has to login first then go to further routes
exports.protect = asyncHandler(async(req , res , next) =>{

    let token;

    let authorization = req.headers.authorization; // so this auhorization and Authorization are same..this will automatically added to the Postman Header Section tab(this are hidden)..click on hidden above the Header tab..previously we add manually but now using environment variable this will set automatically when we hit request
    if(authorization && authorization.startsWith('Bearer')){
        console.log('Inside auth--',authorization);
        token = authorization.split(' ')[1]; //req.headers.authorization=Bearer <token>..so we use split method so that we get token from second position ..split method split string by space and store it in an array..therefore [1]
    }
    
   /*  else if(req.cookies.token)
    {
        token = req.cookies.token;
    } */

    //now validate token that actual token that sent at the time of login to user..if it got token then only he /she do further operation in application..like when we got OTP then only we proceed transaction
    if(!token){
        return next(new ErrorResponse("Not Authorize to access this route(Because token = undefined) means check whether you select token in Authorization tab(select bearer token)" , 401));
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
        return next(new ErrorResponse("Not Authorize to access this route(Because token = undefined) means token modified" , 401));
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
