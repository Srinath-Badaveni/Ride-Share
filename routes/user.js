const express = require("express");
const wrapasync = require("../utils/wrapasync");
const router = express.Router({ mergeParams: true });
const passport = require("passport");
const User = require('../models/user')
const { saveUrl, isLoggedIn } = require("../middleware");
const { login, signup, destory, renderLogin } = require("../controllers/user");
const { date } = require("joi");

router
  .route("/login")
  .post(
    saveUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    login
  )
  .get(renderLogin);

router.route("/signup").post(signup);

router.route("/logout").get(isLoggedIn, destory);

router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  // Check if OTP is correct and not expired
  const timestamp = new Date(user.otpExpiresAt).getTime()
  console.log(Date.now())
  console.log(parseInt(otp, 10))
  console.log(user.otp)
  if (user.otp !== parseInt(otp, 10) || timestamp < Date.now()) {
    console.log(user.otp !== parseInt(otp, 10))
    console.log(timestamp < Date.now())
    console.log(timestamp)
    await User.findByIdAndDelete(user._id)
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  // Mark user as verified
  user.isVerified = true;
  user.otp = undefined; // Clear the OTP
  user.otpExpiresAt = undefined; // Clear OTP expiration

  await user.save();

  req.login(user, (err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Welcome to Ride Share");
    res.redirect("/route");
  });
});

module.exports = router;
