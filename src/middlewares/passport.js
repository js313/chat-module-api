const passport = require('passport');
const passportJWT = require('passport-jwt');
const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;
const model = require('../config/db').users
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET_KEY
};

const strategy = new JwtStrategy(jwtOptions, async (jwtPayload, next) => {
  try {
    const user = await model.findByPk(jwtPayload.id);
    
    if (user) {
      next(null, user);
    } else {
      next(null, false);
    }
  } catch (err) {
    next(err, false);
  }
});

passport.use(strategy);

module.exports = passport;
