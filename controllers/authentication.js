const jwt = require('jwt-simple');
const config = require('../config');
const User = require('../models/user');

// Token Generator - creates a token using a user's id (an immutable record id for gauranteed persistence)
function generateToken(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
}

exports.signup = function(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  // Form Validation goes HERE
  if (!email || !password) {
    return res.status(422).send({ error: 'You must provide an email and password' });
  }

  // Use the Mongoose User model to find a user with an email matching req.body.email
  User.findOne({ email: email }, function(err, existingUser) {
    // If there's an error with the database connection, throw an error
    if (err) {
      return next(err);
    }

    // if a match is found on the email, send a reponse indicating that the email already exists
    if (existingUser) {
      return res.status(422).send({ error: 'Email is in use' });
    }

    // if the previous edge cases did not catch anything...
    // create a new user in our database using the email and password from req.body
    const user = new User({
      email: email,
      password: password
    });

    // save the user model defined above
    user.save(function(err) {
      // if an error occurs while trying to save this record, then throw an error
      if (err) {
        return next(err);
      }

      // otherwise, respond with the inserted created user model
      res.json({ token: generateToken(user) });
    });
  });
}
