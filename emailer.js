const nodemailer = require('nodemailer');
var myEmilCreds = require('./emailcredentials.json');

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

    callBack(info);
  });
};

module.exports = myEmailer;
