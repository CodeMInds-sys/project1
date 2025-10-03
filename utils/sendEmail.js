const nodemailer = require('nodemailer');
const Logger = require('../utils/logger');
const AppError = require('../utils/AppError');
const sendEmail = async ({ email, subject, message, html }) => {
    try { 
        console.log('sendEmail');
    if(!email){
        console.log('email is required');
        return new AppError('email is required', 400);
    }
    // إنشاء ناقل البريد
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD // استخدم كلمة مرور التطبيق من Gmail
        }
    });

    // إعداد خيارات الرسالة
    const mailOptions = {
        from: process.env.EMAIL_USER, 
        to: email,
        subject: subject,
        html: html
    };

    // إرسال البريد
    await transporter.sendMail(mailOptions);
    Logger.info('Email sent successfully');
    console.log('Email sent successfully');
    return true;
    } catch (error) {
        Logger.error('Error sending email', error);
        console.log('Error sending email', error);
        return new AppError('Failed to send email. Please try again', 500);

    }
};

module.exports = sendEmail; 