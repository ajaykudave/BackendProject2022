
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');
const User = require('../models/User.js');

//@desc     Get All Users
//@route    GET(method) and /api/v1/users
//@access   Private/Admin
exports.getUsers =asyncHandler(async (req , res , next)=>{

   res.status(200).json(res.advancedResults);
    //sendTokenResponse(user , res , 200 );
});

//@desc     Get Single User
//@route    GET(method) and /api/v1/users/:userId
//@access   Private/Admin
exports.getUser =asyncHandler(async (req , res , next)=>{

    const user = await User.findById(req.params.userId);

    res.status(200).json({
        success : true,
        data : user
    })
});

//@desc     Create  User
//@route    POST(method) and /api/v1/users
//@access   Private/Admin
exports.createUser =asyncHandler(async (req , res , next)=>{

    const user = await User.create(req.body);

    res.status(201).json({
        success : true,
        data : user
    })
});

//@desc     Update User
//@route    UPDATE(method) and /api/v1/users/:userId
//@access   Private/Admin
exports.updateUser =asyncHandler(async (req , res , next)=>{

    const user = await User.findByIdAndUpdate(req.params.userId , req.body ,{
        new : true,
        runValidators : true
    });
    //please check role is not get updated when i requested

    res.status(200).json({
        success : true,
        data : user,
        message : "User Updated Successfully.!"
    })
});

//@desc     Delete  User
//@route    DELETE(method) and /api/v1/users/:userId
//@access   Private/Admin
exports.deleteUser =asyncHandler(async (req , res , next)=>{

    //const user = await User.findByIdAndDelete(req.params.id , req.body);
     await User.findByIdAndDelete(req.params.userId , req.body); // we write like this bec we delete user nothing will left so in response we sent empty object.

    res.status(201).json({
        success : true,
        data : {},
        message : "User Deleted Successfully.!"
    })
});
