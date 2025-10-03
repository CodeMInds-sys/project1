const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/jwt');
const authController = require('../controllers/authController');
const passport = require('passport');
const { generateToken } = require('../middlewares/jwt');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/verify-email/:token', authController.verifyEmail);

// مثال على route محمي
router.get('/profile', auth, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

router.get('/verifyToken', auth, authController.verifyToken);


router.post('/requestChangePassword', authController.requestChangePassword);

router.get('/verifyChangePassword', authController.verifyChangePassword);

router.post('/changePassword', authController.changePassword);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/' }),
  (req, res) => {
    // إصدار JWT
    const token = generateToken({ id: req.user._id });
    const user = req.user;
    res.redirect(`https://code-minds.vercel.app/profile?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);

  }
);

module.exports = router; 