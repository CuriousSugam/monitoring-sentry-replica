import nodemailer from "nodemailer";

export function mailSender(sender, receiver, subject = "", body = "") {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: sender,
      pass: "sentryWANNABE"
    }
  });
  const mailOptions = {
    from: sender, // sender address
    to: receiver, // list of receivers
    subject: subject, // Subject line
    html: body // plain text body
  };
  transporter.sendMail(mailOptions, function(err) {
    if (err) {
      console.log(err);
    }
  });
}
