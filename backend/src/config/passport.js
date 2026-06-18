const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const user = await User.findById(payload.id).select('-password');

      if (!user) {
        return done(null, false, { message: 'User not found' });
      }

      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  }),
);

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ email: profile.emails[0].value });

          if (!user) {
            user = await User.create({
              name: profile.displayName,
              email: profile.emails[0].value,
              googleId: profile.id,
              avatar: profile.photos[0]?.value,
              isVerified: true,
            });
          } else if (!user.googleId) {
            user.googleId = profile.id;
            user.isVerified = true;
            if (profile.photos[0]?.value && !user.avatar) {
              user.avatar = profile.photos[0].value;
            }
            await user.save();
          }

          return done(null, user);
        } catch (err) {
          return done(err, false);
        }
      },
    ),
  );
}

module.exports = passport;
