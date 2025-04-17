const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { User } = require('../models');
require('dotenv').config();


module.exports = () => {
    passport.use(new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET,
    }, async (jwtPayload, done) => {
        try {
            const user = await User.findOne({ where: { email: jwtPayload.email } });
            if (user) {
                return done(null, user);
            }
            return done(null, false);
        } catch (e) {
            console.error(e);
            return done(e, false);
        }
    }));
}