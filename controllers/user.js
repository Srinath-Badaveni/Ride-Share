const User = require("../models/user");
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "ridesharing.startup@gmail.com",
    pass: "jhdjprsijppcqmbh",
  },
});

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000) // 6-digit OTP
};

// Send OTP Email
const sendOTPEmail = (userEmail, otp) => {
  const mailOptions = {
    from: 'ridesharing.startup@gmail.com',
    to: userEmail,
    subject: 'Verify your email with OTP',
    html: `<h2>Your OTP is: ${otp}</h2>
           <p>This OTP will expire in 10 minutes.</p>`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};

module.exports.renderLogin = (req, res) => {
    res.render("user/login.ejs");
  }


module.exports.login = async(req, res) => {
  req.flash("success", "welcome back!!");
  let redirectUrl = res.locals.redirectUrl || "/route";
  res.redirect(redirectUrl);
};

module.exports.signup = async (req, res) => {
  const { username, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Generate OTP
  const otp = generateOTP();

  // Send OTP to user's email
  sendOTPEmail(email, otp);

  // Temporarily store OTP and its expiration (10 minutes)
  // const hashedPassword = await bcrypt.hash(password, 12);

  // const newUser = new User({ email, username,password:hashedPassword });

  const newUser = new User({
    username,
    email,
    otp,
    otpExpiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes from now
    isVerified: false, // Set as false initially
  });
  console.log(newUser)
  await User.register(newUser, password);


  res.render("user/otp.ejs",{email})
};

module.exports.destory = (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "logout success");
    res.redirect("/route");
  });
};
