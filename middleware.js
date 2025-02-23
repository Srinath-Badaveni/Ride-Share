const ExpressError = require("./utils/expressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const { model } = require("mongoose");
const Route = require("./models/route.js");
var nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MY_EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

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
  let currentDate = new Date();
  currentDate.setMinutes(currentDate.getMinutes());
  if (currentDate > ride.date) {
    await Route.findByIdAndDelete(id);
    return res.status(404).send("This route has expired.");
  }
  next();
};

module.exports.sendEmail = async (MailOptions) => {
  return new Promise((resolve, reject) => {
    transporter.sendMail(MailOptions, (error, info) => {
      if (error) {
        console.log(error);
        reject(error); // Reject the promise if there's an error
      } else {
        console.log("Email sent: " + info.response);
        resolve(info); // Resolve the promise with the info if successful
      }
    });
  });
};

module.exports.convertToMinutes = (timeString) => {
  // Split the time string into hours and minutes
  let [hours, minutes] = timeString.split(":").map(Number);

  // Convert hours to minutes and add the minutes
  return hours * 60 + minutes;
};


// Haversine Formula to Calculate Distance Between Two Coordinates
module.exports.calculateDistance = (coords1, coords2) => {
  const toRad = (value) => (value * Math.PI) / 180;

  const [lat1, lon1] = coords1.split(',').map(Number);
  const [lat2, lon2] = coords2.split(',').map(Number);

  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in KM
};
