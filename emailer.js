const nodemailer = require('nodemailer');
var myEmilCreds = require('./emailcredentials.json');

/*
var fs = require('fs');
mailOptions.html = fs.readFileSync('scb.html');
*/

var myEmailer = function(mailTo,subject, myHtml, callBack) {

  // setup email data with unicode symbols
  var mailOptions = {
    from: '[Your email address here]', // sender address
    to: '', //req.body.uname, // list of receivers
    subject: '', // Subject line
    text: '', // plain text body
    html: '<b>Hello world?</b>' // html body
  };

  mailOptions.to = mailTo;
  mailOptions.subject = subject;
  mailOptions.html = myHtml;

  // create reusable transporter object using the default SMTP transport
  var transporter = nodemailer.createTransport(myEmilCreds);

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    // console.log(info);
    //console.log('Message sent: %s', info.messageId);
    // Preview only available when sending through an Ethereal account
    //console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@blurdybloop.com>
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    callBack(info);
  });
};

module.exports = myEmailer;
