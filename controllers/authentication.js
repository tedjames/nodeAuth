const jwt = require('jwt-simple');
const config = require('../config');
const User = require('../models/user');

// Token Generator - creates a token using a user's record id (an immutable record id for gauranteed persistence)
function generateToken(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
}

exports.signin = function(req, res, next) {
  // User has had their email and password auth'd
  // We just need to give them their token
  res.send({ token: generateToken(req.user) });
}

exports.signup = function(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  // Form Validation goes HERE
  if (!email || !password) {
    return res.status(422).send({ error: 'You must provide an email and password' });
  }

  // Find a user with a matching email
  User.findOne({ email: email }, function(err, existingUser) {
    if (err) { return next(err); } // Error occured while searching for user
    if (existingUser) { // Match was found
      return res.status(422).send({ error: 'Email is already in use' });
    }
    // Since no user already exists, make a new one
    const user = new User({
      email: email,
      password: password
    });

    // Save the user model as defined above
    user.save(function(err) {
      if (err) { // Error occured while savings the model to mongodb
        return next(err);
      }
      // User successfully saved, now here's your token:
      res.json({ token: generateToken(user) }); // Generate + return a token in a response
    });
  });
}
