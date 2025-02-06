const nodemailer = require('nodemailer');

sendEmail = async (email, subject, html) => {

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for port 465, false for other ports
        auth: {
            user: process.env.NODE_MAILER_EMAIL,
            pass: process.env.NODE_MAILER_PASS,
        },
    });

    try {
        console.log('ola')
        const info = await transporter.sendMail({
            from: '"Sistema Bancario" <>' , // sender address
            to: email, // list of receivers
            subject: subject, // Subject line
            html: html, // html body
        });
        
        return true;
    } catch {
        return false;
    }
}

module.exports = sendEmail;