const { required, string } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
    max: 9999999999,
  },
  seatsBooked: {
    type: Number,
    required: true,
    min: 1,
  },
  startLocation: {
    type: String,
    required: true,
    trim: true,
  },
  destinationLocation: {
    type: String,
    required: true,
    trim: true,
  },
  time: {
    type: String, // You can use Date type if you're working with a full date-time.
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Booking", bookingSchema);
