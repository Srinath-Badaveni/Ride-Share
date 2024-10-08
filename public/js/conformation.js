const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-email-password',
  },
});

// Generate OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
};

// Send OTP Email
const sendOTPEmail = (userEmail, otp) => {
  const mailOptions = {
    from: 'your-email@gmail.com',
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
