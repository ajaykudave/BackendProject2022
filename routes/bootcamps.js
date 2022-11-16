//we maintain routes here in another file

const express = require('express');
const router  = express.Router(); //in order to use express router we first load express module

//so i bring that methods(controller logic)here by destructuring
const {getBootcamps,getBootcampById,createBootcamp,upadteBootcamp,deleteBootcamp, getBootcampByRadius} = require('../controllers/bootcamps.js'); //first dot tell out from routes folder then 2nd dot for root folder then controllers folder

//Include other Resource routers
const courseRouter = require('./courses.js');

//Re-route(route forwarding) into other resource routers..means from bootcamps route we go to course route
router.use('/:bootcampId/courses' , courseRouter);//--look like /api/v1/bootcamps/:123344/courses..this will go to the course route file and where it add or merge automaticaly at router.route(/here).get(courses)

router.route('/radius/:zipcode/:distance').get(getBootcampByRadius);

router
.route('/')
.get(getBootcamps)
.post(createBootcamp);

router
.route('/:bootcampId')
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