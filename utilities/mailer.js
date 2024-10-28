const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

exports.sendConfirmationEmail = (userEmail, userName) => {
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Confirmation de votre inscription',
    html: `<h1>Bienvenue, ${userName} !</h1>
           <p>Votre inscription a bien été prise en compte. Merci d'avoir rejoint notre plateforme.</p>`,
  });
};