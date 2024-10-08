const bookings = require("../models/bookings");
const Bookings = require("../models/bookings");
const Route = require("../models/route");
require('dotenv').config();

var nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MY_EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports.renderBookNow = async (req, res) => {
  const { id } = req.params;
  const ride = await Route.findById(id).populate("owner");
  res.render("home/bookRide", { ride });
};

module.exports.booking = async(req,res)=>{
  const { rideId, name, phone, email, seatsBooked } = req.body;
  const ride = await Route.findById(rideId).populate("owner");
  res.render("booking/preBooking.ejs",{name, phone, email, seatsBooked,ride})
}

module.exports.conformBooking = async (req, res) => {
  const { rideId } = req.body;
  const newBooking = new Bookings(req.body.booking);
  const ride = await Route.findById(rideId).populate("owner");
  const prevSeats = ride.seats;
  console.log(newBooking.seatsBooked)
  if (prevSeats < newBooking.seatsBooked) {
    req.flash("error", "Seats limit exceted");
    res.redirect(`/book-now/${rideId}`);
  }
  const currSeats = prevSeats - newBooking.seatsBooked;
  if(currSeats < 0){
    res.flash("error", "Seats limit exceted");
    res.redirect(`/book-now/${rideId}`);
  }
  await Route.findByIdAndUpdate(rideId, { seats: currSeats });
  ride.bookings.push(newBooking);
  var coustmerMailOptions = {
    from: "rideshare.startup.com",
    to: newBooking.email,
    subject: "Your Booking has been Conformed on Ride Share",
    html: `<h2>Booking confirmed for ride ID: ${newBooking._id} with ${newBooking.seatsBooked} seats.</h2>
    <h4>Your ride details : </h3>
    <h4><b>Starting Location</b>: ${ride.startLocation}</h5>
    <h4><b>Destination Location</b>: ${ride.destinationLocation}</h5>
    <h4><b>Date</b>: ${ride.date}</h5>
    <h4><b>Time</b>: ${ride.time}</h5>
    <p><b>Thanks for choosing Ride Share</b></p>`,
  };

  var sellerMailOptions = {
    from: "rideshare.startup.com",
    to: ride.owner.email,
    subject: `Your ride has been successfully booked`,
    html: `<h3>Booking Details : </h3>
    <h4><b>Name</b>: ${newBooking.name}</h4>
    <h4><b>Mail</b>: ${newBooking.email}</h4>
    <h4><b>Contact Number</b>: ${newBooking.phone}</h4>
    <h4><b>seatsBooked</b>: ${newBooking.seatsBooked}</h4>`,
  };

  transporter.sendMail(sellerMailOptions, function (error, info) {
    if (error) {
      console.log('not sent');
    } else {
      console.log("Email sent: " + info.response);
    }
  });
  transporter.sendMail(coustmerMailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
  await ride.save();
  await newBooking.save();
  res.render("booking/conform.ejs", { newBooking });
};

module.exports.deleteBooking = async (req, res) => {
  let { id, bookingId } = req.params;
  const route = await Route.findByIdAndUpdate(id, {
    $pull: { bookings: bookingId },
  });
  const booking = await bookings.findById(bookingId);
  await Route.findByIdAndUpdate(id, {
    seats: route.seats + booking.seatsBooked,
  });
  await bookings.findByIdAndDelete(bookingId);
  req.flash("success", "Booking cancled successfully!!");
  res.redirect(`/bookings`);
};
