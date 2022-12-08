const nodemailer = require("nodemailer");
const dotenv    = require('dotenv');

//dotenv.config({path :'../config/config.env'});..if error come try to uncomment this line there could be chance that we unable to fetch environment variable in this code..in such case try to print variables in console

const sendEmails = async (options) => {

    //defining an transporter object which is use to send an email..defining transport mean we provide an host value and all
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL, // generated ethereal user
      pass: process.env.SMTP_PASSWORD , // generated ethereal password
    },
  });

  // send mail with defined transport object
  const mailData = {
    from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`, // sender address
    to: options.email, // list of receivers
    subject: options.subject, // Subject line
    text: options.message, // plain text body
  };

  const info = await transporter.sendMail(mailData);

  console.log("Message sent: %s", info.messageId);
}

module.exports = sendEmails;