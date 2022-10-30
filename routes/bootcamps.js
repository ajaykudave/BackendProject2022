//we maintain routes here in another file

const express = require('express');
const router  = express.Router(); //in order to use express router we first load express module

//so i bring that methods(controller logic)here by destructuring
const {getBootcamps,getBootcampById,createBootcamp,upadteBootcamp,deleteBootcamp} = require('../controllers/bootcamps.js'); //first dot tell out from routes folder then 2nd dot for root folder then controllers folder

router
.route('/')
.get(getBootcamps)
.post(createBootcamp);

router
.route('/:id')
.put(upadteBootcamp)
.delete(deleteBootcamp)
.get(getBootcampById);




/* router.get('/' ,(req ,res)=>{
  
   
});
//get bootcamp by id if id =1 from db
router.get('/:id' ,(req,res)=>{

    res.status(200).json({
        success : true , msg : `Show bootcamp ${req.params.id}`
    });
});

//route for post
router.post('/',(req,res)=>{
    res.status(200).json({
        success : true, msg : 'Created new Bootcamp or data inserted'
    });
});
//update route
router.put('/:id',(req,res)=>{
    res.status(200).json({success : true,msg :`Updated bootcamp of Id ${req.params.id}`});
});
//delete route
router.delete('/:id' , (req,res)=>{
    res.status(200).json({
        success : true, msg : `deleted bootcamp of Id ${req.params.id}`
    })
});
 */
module.exports = router; //export so that it can used outside.