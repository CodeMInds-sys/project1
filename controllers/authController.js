const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { generateToken, verifyToken } = require('../middlewares/jwt');
const path = require('path');
const fs = require('fs').promises;
const Logger = require('../utils/logger');



const sendVerificationEmail = async (email, name, verificationUrl) => {
    try {
        let emailTemplate = await fs.readFile(
            path.join(__dirname, '../public/email/verification.html'),
            'utf8'
    );
    
    emailTemplate = emailTemplate
        .replace(/\{\{name\}\}/g, name)
        .replace(/\{\{verificationUrl\}\}/g, verificationUrl)
        .replace(/\{\{logoUrl\}\}/g, `${process.env.BASE_URL}/images/logo.png`)
        .replace(/\{\{year\}\}/g, new Date().getFullYear().toString());

    await sendEmail({
        email,
        subject: 'Verify your email address',
        html: emailTemplate
    }); 
    return true;
    } catch (error) {
        Logger.error('Error sending verification email', error);
        return new AppError('Failed to send verification email. Please try again', 500);
    }
};  

const sendVerificationChangePasswordEmail = async (email, name, verificationUrl) => {
    try {
        let emailTemplate = await fs.readFile(
            path.join(__dirname, '../public/email/verificationChangePassword.html'),
            'utf8'
    );
    
    emailTemplate = emailTemplate
        .replace(/\{\{name\}\}/g, name)
        .replace(/\{\{verificationUrl\}\}/g, verificationUrl)
        .replace(/\{\{year\}\}/g, new Date().getFullYear().toString());

    await sendEmail({
        email,
        subject: 'Verify your email address to change password',
        html: emailTemplate
    }); 
    return true;
    } catch (error) {
        Logger.error('Error sending verification email', error);
        return new AppError('Failed to send verification email. Please try again', 500);
    }
};  

const authController = {
    // تسجيل مستخدم جديد
    register: asyncHandler(async (req, res) => {
        const { email, password, name ,phone} = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser ) {
            throw new AppError('user already exists  ', 400);
        }
        // إنشاء المستخدم الجديد
        const verificationToken =await generateToken({ email , name ,password,phone}  , '30m');

        const verificationUrl = `${process.env.BASE_URL}/api/auth/verify-email/${verificationToken}`;
        
       
        const emailSent = await sendVerificationEmail(email, name, verificationUrl);
        if (emailSent instanceof AppError) {
            throw emailSent;
        }

        res.status(201).json({
            success: true,
            message: 'تم إنشاء الحساب بنجاح. من فضلك تحقق من بريدك الإلكتروني (بما في ذلك قسم الرسائل غير المهمة) لتفعيل الحساب.'
        });

    }),

    // تسجيل الدخول
    login: asyncHandler(async (req, res) => {
        const { email, password ,rememberMe } = req.body;  

        let user = await User.findOne({ email })
        .populate('profileRef')
  
        if (!user ) {
            throw new AppError('user not found', 401);
        }
        if (!(await user.comparePassword(password)) ) {
            throw new AppError('wrong password', 401);
        }
        console.log(user);
  
        
        // إنشاء توكن جديد وتحديث التوكن القديم
        const authToken = generateToken({ id: user._id },rememberMe?  '':'1d');
        user.authToken = authToken;
        await user.save();
        if (!user) throw new AppError('User not found', 404);
        
        // خطوة 1: populate لـ profileRef 
        if(user.role==='student'){
            await user.populate({
            path: 'profileRef',
            model: user.profileModel, // Student مثلاً
            populate: [
                { path: 'courses' ,select:'title _id imageURL ' },
                { path: 'groups' ,select:'title _id startDate endDate ',
                    populate:{
                        path:'instructor',
                        select:'name '
                    },
                    populate:{
                        path:'course',
                        select:'title '
                    },
                    populate:{
                        path:'lectures',
                        // select:'title '
                    }
                 }
            ]
            });
        }
        else if(user.role==='instructor'){
            await user.populate({
                path: 'profileRef'
            });
        }
        
        res.status(200).json({
            success: true,
            token: authToken,
            user,
            message: 'تم تسجيل الدخول بنجاح'
        });
    }),

    // تفعيل الحساب
    verifyEmail: asyncHandler(async (req, res) => {
        const { token } = req.params;

        try {
            // التحقق من التوكن
            const decoded = verifyToken(token);
            if( !decoded){
                throw new AppError('Invalid token', 401);
            }
            const {name, email, password,phone} = decoded;
            const existingUser=await User.findOne({email});
            console.log("exist user ",existingUser);
            
            if (existingUser) {
                let msg=await fs.readFile(
                    path.join(__dirname,"../public/email/responses/message.html")
                    ,"utf-8" 
                )
                msg =msg.replace('{{message}}',"user is already exist please login ")
                msg=msg.replace('{{subject}}',"exist user")
                res.end(msg);      
                return;
            }   
            const hashedPassword=bcrypt.hashSync(password, 10); 
            
            await User.create({
                name,
                email,
                password:hashedPassword,
                phone,
            });
            
            // قراءة صفحة النجاح
            let successHtml = await fs.readFile(
                path.join(__dirname, '../public/email/responses/success.html'),
                'utf8'
            );
            successHtml = successHtml.replace('{{message}}', 'تم التحقق من بريدك الإلكتروني بنجاح');
            
            // إرسال صفحة النجاح
            res.send(successHtml);

        } catch (error) {
            // في حالة وجود خطأ في التوكن
            const errorHtml = await fs.readFile(
                path.join(__dirname, '../public/email/responses/error.html'),
                'utf8'
            );
            
            // إرسال صفحة الخطأ مع رسالة الخطأ
            res.send(
                errorHtml.replace('{{errorMessage}}', error.message )
            );
        }
    }),



    verifyToken:asyncHandler(async (req, res) => {
        const userId = req.user._id;
        let user = await User.findById(userId);
        
        if (!user) throw new AppError('User not found', 404);
        
        // خطوة 1: populate لـ profileRef 
        if(user.role==='student'){
            await user.populate({
            path: 'profileRef',
            model: user.profileModel, // Student مثلاً
            populate: [
                { path: 'courses' ,select:'title _id imageURL ' },
                { path: 'groups' ,select:'title _id startDate endDate ',
                    populate:{
                        path:'instructor',
                        select:'name '
                    },
                    populate:{
                        path:'course',
                        select:'title '
                    },
                    populate:{
                        path:'lectures',
                        // select:'title '
                    },
    

                 },
                 { path: 'courseProgress',
                    populate:{
                        path:'course',
                        select:'title '
                    },
                    populate:{
                        path:'lectureProgress',
                    }
                  },
            ]
            });
        }
        else if(user.role==='instructor'){
            await user.populate({
                path: 'profileRef'
            });
        }

        
        res.status(200).json({ 
            success: true,
            user,
            message: 'token is valid'
        });
    }),

    requestChangePassword: asyncHandler(async (req, res) => {
        const { email } = req.body;
    
        const user = await User.findOne({ email });
        if (!user) {
            // علشان ما نديش معلومة أصلاً لو الإيميل موجود ولا لأ
            return res.status(200).json({
                success: true,
                message: 'if email is valid we will send you a verification link'
            });
        }
    
        // نولد التوكن
        const verificationToken = await generateToken({ email }, '30m');
    
        // نحفظ في الداتا بيز إن فيه توكن مستخدم
        user.resetPasswordTokenUsed = false;
        await user.save();
    
        const verificationUrl = `${process.env.BASE_URL}/api/auth/verifyChangePassword?token=${verificationToken}`;
    
        const emailSent = await sendVerificationChangePasswordEmail(email, user.name, verificationUrl);
        if (emailSent instanceof AppError) {
            throw emailSent;
        }
    
        res.status(200).json({
            success: true,
            message: 'if email is valid we will send you a verification link'
        });
    }),
    


    verifyChangePassword: asyncHandler(async (req, res) => {
        const { token } = req.query;
    
        const decoded = verifyToken(token);
        if (!decoded) {
            let errorPage=await fs.readFile(
                path.join(__dirname, '../public/email/responses/error.html'),
                'utf8'
            );
            errorPage=errorPage.replace('{{errorMessage}}', 'رابط غير صالح أو منتهي الصلاحية');
            res.end(errorPage);
            return;
        }
    
        const { email } = decoded;
        const user = await User.findOne({ email });
    
        if (!user || user.resetPasswordTokenUsed ) {
            let errorPage=await fs.readFile(
                path.join(__dirname, '../public/email/responses/error.html'),
                'utf8'
            );
            errorPage=errorPage.replace('{{errorMessage}}', 'رابط غير صالح أو منتهي الصلاحية');
            res.end(errorPage);
            return;
        }
    
        // نعرض صفحة تغيير الباسورد
        let changePasswordPage = await fs.readFile(
            path.join(__dirname, '../public/email/responses/changePasswordPage.html'),
            'utf8'
        );
    
        changePasswordPage = changePasswordPage.replace('{{name}}', user.name);
        changePasswordPage = changePasswordPage.replace('{{verificationUrl}}', `${process.env.BASE_URL}/api/auth/changePassword?token=${token}`);
        changePasswordPage = changePasswordPage.replace('{{year}}', new Date().getFullYear().toString());
    
        res.end(changePasswordPage);
    }),
    

    changePassword: asyncHandler(async (req, res) => {
        const { token } = req.query;
    
        const decoded = verifyToken(token);
        if (!decoded) {
            let errorPage=await fs.readFile(
                path.join(__dirname, '../public/email/responses/error.html'),
                'utf8'
            );
            errorPage=errorPage.replace('{{errorMessage}}', 'رابط غير صالح أو منتهي الصلاحية');
            res.end(errorPage);
            return;
        }
    
        const { email } = decoded;
        const user = await User.findOne({ email });
    
        if (!user || user.resetPasswordTokenUsed ) {
            let errorPage=await fs.readFile(
                path.join(__dirname, '../public/email/responses/error.html'),
                'utf8'
            );
            errorPage=errorPage.replace('{{errorMessage}}', 'رابط غير صالح أو منتهي الصلاحية');
            res.end(errorPage);
            return;
        }
    
        const { password, confirmPassword } = req.body;
        if (password !== confirmPassword) {
            let errorPage=await fs.readFile(
                path.join(__dirname, '../public/email/responses/error.html'),
                'utf8'
            );
            errorPage=errorPage.replace('{{errorMessage}}', 'كلمات المرور غير متطابقة');
            res.end(errorPage);
            return;
        }
    
        user.password = bcrypt.hashSync(password, 10);
        user.resetPasswordTokenUsed = true;
        await user.save();
    
        let successHtml = await fs.readFile(
            path.join(__dirname, '../public/email/responses/success.html'),
            'utf8'
        );
    
        successHtml = successHtml.replace('{{message}}', 'تم تغيير كلمة المرور بنجاح');
        successHtml = successHtml.replace('{{year}}', new Date().getFullYear().toString());
    
        res.end(successHtml);
    }),
    


};


const sendEmailtoAllUsers =asyncHandler(async (subject, message) => {
    console.log('sendEmailtoAllUsers');
    const users = await User.find({email:'mohamed12345abdullah@gmail.com'});
    // console.log(users.length);
    const html=`
    <div>
        <h1> easy register and login </h1>
        <p>now you can login to your account with one click by clicking on continue with google or continue with facebook</p>
        <button> <a href="https://code-minds.vercel.app/login"> go to log in page </a></button>
    </div>
    `
    for (const user of users) {
        console.log(user.email);
        await sendEmail(
            {
                email: user.email,
                subject,
                message,
                html
            }
        );
    }
});
// sendEmailtoAllUsers('easy register and login', 'now you can login to your account with one click by clicking on continue with google or continue with facebook');





module.exports = authController; 