
const dotenv = require("dotenv");
dotenv.config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BASE_URL}/api/auth/google/callback`
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // استخراج البيانات من profile
      const email = profile.emails[0].value;
      const name = profile.displayName;
      const avatar = profile.photos[0].value;
      const googleId = profile.id;

      // ابحث عن المستخدم
      let user = await User.findOne({ email });

      if (!user) {
        // لو مش موجود، أنشئ مستخدم جديد
        user = await User.create({
          name,
          email,
          googleId,
          avatar,
          // أضف أي بيانات أخرى حسب الحاجة
        });
      } else {
        // لو موجود، حدث بياناته من جوجل (اختياري)
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

passport.serializeUser((user, done) => {
  done(null, user.id);
});


passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

module.exports = passport;
 