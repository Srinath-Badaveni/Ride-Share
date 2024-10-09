const ExpressError = require("./utils/expressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const { model } = require("mongoose");
const Route = require("./models/route.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    res.locals.redirectUrl = req.originalUrl;
    req.flash("error", "Login to Continue");
    return res.redirect("/user/login");
  }
  next();
};

module.exports.saveUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Route.findById(id);
  if (!listing.owner._id.equals(res.locals.currUser._id)) {
    req.flash("error", "Acces denied ! Not a valid Owner");
    return res.redirect(`/route`);
  }
  next();
};

// Middleware to check expiration
module.exports.checkExpiration = async (req, res, next) => {
  const { id } = req.params;
  const ride = await Route.findById(id).populate("owner");
  const currentTime = new Date();
  if (currentTime > ride.date) {
      await Route.findByIdAndDelete(id)
      return res.status(404).send('This route has expired.');
  }
  next();
};
