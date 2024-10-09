const bookings = require("../models/bookings");
const Bookings = require("../models/bookings");
const Route = require("../models/route");
require("dotenv").config();
var nodemailer = require("nodemailer");
const User = require("../models/user");

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

module.exports.booking = async (req, res) => {
  const { rideId, name, phone, email, seatsBooked } = req.body;
  const ride = await Route.findById(rideId).populate("owner");
  const user = await User.find({ email: email });
  const tempBooking = {
    seats: seatsBooked,
    expTime: Date.now() + 5 * 60 * 1000,
  };
  ride.tempBookings.push(tempBooking);
  console.log(ride);
  user[0].tempSeat.seats = seatsBooked;
  user[0].tempSeat.expTime = Date.now() + 5 * 60 * 1000;
  ride.seats = ride.seats - seatsBooked;
  await user[0].save();
  await ride.save();
  res.render("booking/preBooking.ejs", {
    name,
    phone,
    email,
    seatsBooked,
    ride,
  });
};

module.exports.conformBooking = async (req, res) => {
  const { rideId } = req.body;
  const newBooking = new Bookings(req.body.booking);
  const ride = await Route.findById(rideId).populate("owner");
  const user = await User.find({ email: newBooking.email });
  ride.bookings.push(newBooking);
  var track = 0;
  async function sendEmail(customerMailOptions) {
    return new Promise((resolve, reject) => {
      transporter.sendMail(customerMailOptions, (error, info) => {
        if (error) {
          console.log(error);
          reject(error); // Reject the promise if there's an error
        } else {
          console.log("Email sent: " + info.response);
          resolve(info); // Resolve the promise with the info if successful
        }
      });
    });
  }

  // Usage in an async function
  (async () => {
    try {
      const customerMailOptions = {
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

      const sellerMailOptions = {
        from: "rideshare.startup.com",
        to: ride.owner.email,
        subject: `Your ride has been successfully booked`,
        html: `<h3>Booking Details : </h3>
    <h4><b>Name</b>: ${newBooking.name}</h4>
    <h4><b>Mail</b>: ${newBooking.email}</h4>
    <h4><b>Contact Number</b>: ${newBooking.phone}</h4>
    <h4><b>seatsBooked</b>: ${newBooking.seatsBooked}</h4>`,
      };

      const info = await sendEmail(customerMailOptions); // Wait for the email to be sent
      const info1 = await sendEmail(sellerMailOptions);
      console.log("Email sent info:", info);
      console.log("Email sent info:", info1);
      if (new Date < user[0].tempSeat.expTime) {
        await ride.save();
        await newBooking.save();
      } else {
        ride.seats = ride.seats + newBooking.seatsBooked;
        await ride.save();
        return res.send("some error occured Plz try again later");
      }
      res.render("booking/conform.ejs", { newBooking });
    } catch (error) {
      return res.send("some error occured in email");
      // Handle the error as needed
    }
  })();
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
