const passport = require('passport');
const User = require('../models/user');
const config = require('../config');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');

// Local strategy for obtaining a token:
const localOptions = { usernameField: 'email' } // Strategy options

// New local strategy using passport-local.LocalStrategy()
const localLogin = new LocalStrategy(localOptions, function(email, password, done) {
  User.findOne({ email: email }, function(err, user) { // Find a user record with the provided email
    if (err) { return done(err); } // error occured while trying to find that user
    if (!user) { return done(null, false); } // user does not exist

    // since the user exists, compare the passwords
    user.comparePassword(password, function(err, isMatch) {
      if (err) { return done(err); } // error occured while trying to compare passwords
      if (!isMatch) { return done(null, false); } // not a match
      return done(null, user); // it's a match!
    })
  })
});

// Setup options for JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: config.secret
};

// Create JWT Strategy - done() is used to return a callback
// 1. Create a new JwtStrategy with jwtOptions (for jwt decoding w/ ExtractJwt)
// 2. Take the payload.sub, aka user.id, and find a User record with that id
// 3. If an error occurs, return the error and false
// 4. If a user is found, return null and the user object
// 5. If a user is not found, return null and false
const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {
  User.findById(payload.sub, function(err, user) {
    if (err) { // Error while trying to find user!
      return done(err, false);
    }
    if (user) { // User found :)
      return done(null, user);
    }
    else { // User not found :(
      done(null, false)
    }
  });
});

// Tell passport to use the strategy
passport.use(jwtLogin);
passport.use(localLogin);
