const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/user');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BASE_URL}/api/auth/google/callback`
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const name = profile.displayName;
      const avatar = profile.photos[0].value;
      const googleId = profile.id;

      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          name,
          email,
          googleId,
          avatar,
          // يمكنك إضافة بيانات افتراضية أخرى إذا كان لديك حقول مطلوبة
          password: Math.random().toString(36).slice(-8), // كلمة مرور عشوائية (لن يستخدمها)
          phone: '01000000000', // قيمة افتراضية إذا كان الحقل مطلوب
        });
      } else {
        user.googleId = googleId;
        user.avatar = avatar;
        await user.save();
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

module.exports = passport; 