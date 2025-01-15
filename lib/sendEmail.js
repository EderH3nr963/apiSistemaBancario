exports.sendEmail = async (email, subject, html) => {

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for port 465, false for other ports
        auth: {
            user: process.env.EMAIL_NODEMAILER,
            pass: process.env.PASSWD_NODEMAILER,
        },
    });

    try {
        const info = await transporter.sendMail({
            from: '"Sistema Bancario" <' + process.env.EMAIL_NODEMAILER + '>' , // sender address
            to: email, // list of receivers
            subject: subject, // Subject line
            html: html, // html body
        });
        
        return true;
    } catch {
        return false;
    }
}