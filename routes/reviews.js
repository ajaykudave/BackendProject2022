const express = require('express');
const router  = express.Router({ mergeParams : true});
const Review  = require('../models/Review.js');

//controllers method fetch here
const { getReviews , getReview , addReview , updateReview , deleteReview} = require('../controllers/reviews.js')

//middlewares for pagination and stuff,and for login and authorize role check
const advancedResults           = require('../middlewares/advancedResults.js');
const { protect , authorize }   = require('../middlewares/auth.js');

router
.route('/')
.get(advancedResults(Review ,{
    path : 'bootcamp',
    select : 'name description'

}) , getReviews)
.post(protect , authorize('user' , 'admin') , addReview)

/* router
.route('/:bootcampId/reviews')
.post(protect , authorize('user' , 'admin') , addReview) ..this mean first user first login then logged in user must be user or admin role..because how can publisher can provide review to ownself..only people decide whether it s good or Bad Boocamp*/
router
.route('/:reviewId')
.get(getReview)
.put(protect , authorize('user' , 'admin') , updateReview)//except pubisher role remaining user ,admin can update review
.delete(protect , authorize('user' , 'admin') , deleteReview)

module.exports = router;

