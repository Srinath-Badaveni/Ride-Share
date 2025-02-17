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

module.exports.renderBookNow = async (req, res) => {
  const { id } = req.params;
  const ride = await Route.findById(id).populate("owner");
  res.render("home/bookRide", { ride ,MAPBOXKEY:process.env.MAPBOX_KEY});
};

module.exports.booking = async (req, res) => {
  const { rideId, name, phone, email, seatsBooked } = req.body;
  const ride = await Route.findById(rideId).populate("owner");
  console.log(ride.date);
  const user = await User.find({ email: email });
  const tempBooking = {
    userMail: email,
    seats: seatsBooked,
    expTime: Date.now() + 5 * 60 * 1000,
  };
  ride.tempBookings.push(tempBooking);
  console.log(ride.tempBookings);
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
      if (Date.now() < user[0].tempSeat.expTime) {
        await sendEmail(customerMailOptions); // Wait for the email to be sent
        await sendEmail(sellerMailOptions);
        for (let booking of ride.tempBookings) {
          if (booking.userMail === newBooking.email) {
            ride.tempBookings.splice(booking, 1);
          }
        }
        await ride.save();
        await newBooking.save();
      } else {
        const msg = "Session timeout Please try again";
        return res.render("error/emailerror.ejs", { msg });
      }
      res.render("booking/conform.ejs", { newBooking });
    } catch (error) {
      const msg = "Some error occured in network conneciton";
      return res.render("error/emailerror.ejs", { msg });
    }
  })();
};

module.exports.deleteBooking = async (req, res) => {
  let { id, bookingId } = req.params;
  const booking = await bookings.findById(bookingId);
  const route = await Route.findById(id).populate("owner");
  // Immediately invoked async function
  (async () => {
    try {
      const customerMailOptions = {
        from: "rideshare.startup.com",
        to: booking.email,
        subject: "Your booking has been successfully canceled :(",
        html: `<h2>Booking ride ID: ${booking._id} with ${booking.seatsBooked} seats.</h2>
        <h4>Your ride details:</h4>
        <h4><b>Starting Location</b>: ${route.startLocation}</h4>
        <h4><b>Destination Location</b>: ${route.destinationLocation}</h4>
        <h4><b>Date</b>: ${route.date}</h4>
        <h4><b>Time</b>: ${route.time}</h4>
        <h1><b>Sorry for the inconvenience</b></h1>`,
      };

      const sellerMailOptions = {
        from: "rideshare.startup.com",
        to: route.owner.email,
        subject: "Your ride has been canceled",
        html: `<h3>Booking Details:</h3>
        <h4><b>Name</b>: ${booking.name}</h4>
        <h4><b>Mail</b>: ${booking.email}</h4>
        <h4><b>Contact Number</b>: ${booking.phone}</h4>
        <h4><b>Seats Booked</b>: ${booking.seatsBooked}</h4>
        <h1>Sorry for the inconvenience</h1>`,
      };

      console.log("hi");
      await sendEmail(customerMailOptions);
      await sendEmail(sellerMailOptions);
      console.log("bye");

      // Remove the booking and update the seats
      await Route.findByIdAndUpdate(id, {
        $pull: { bookings: bookingId },
      });
      await bookings.findByIdAndDelete(bookingId);
      await Route.findByIdAndUpdate(id, {
        seats: route.seats + booking.seatsBooked,
      });

      req.flash("success", "Booking canceled successfully!!");
      res.redirect(`/bookings`);
    } catch (err) {
      console.error(err); // Log the actual error
      req.flash("error", "Some error occurred!");
      res.redirect(`/bookings`);
    }
  })(); // Immediately invoked function
};
