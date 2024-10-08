const ExpressError = require("./utils/expressError.js");
const { listingSchema,reviewSchema } = require("./schema.js");
const { model } = require("mongoose");
const Route = require("./models/route.js");

module.exports.isLoggedIn = (req, res,next) => {
  if (!req.isAuthenticated()) {
    res.locals.redirectUrl = req.originalUrl
    req.flash("error", "Login to Continue");
    return res.redirect("/user/login");
  }
  next();
};

module.exports.saveUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl
    }
    next()
}

module.exports.isOwner = async(req,res,next)=>{
    let {id} = req.params;
    let listing = await Route.findById(id)
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error","Acces denied ! Not a valid Owner")
        return res.redirect(`/route`)
    }
    next()
}

module.exports.validataListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => {
      el.message.join(",");
    });
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.validataReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message.join(","));
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.isReviewAuthor = async(req,res,next)=>{
  let {id , reviewId} = req.params;
  let review = await Route.findById(reviewId)
  if(!review.author._id.equals(res.locals.currUser._id)){
      req.flash("error","Acces denied ! Not a valid Owner")
      return res.redirect('/route')
  }
  next()
}