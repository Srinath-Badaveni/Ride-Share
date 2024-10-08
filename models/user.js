const { required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  otp: {
    type: Number,
  },
  otpExpiresAt: {
    type: Date,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
