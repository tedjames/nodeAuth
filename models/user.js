const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

// Define the model
const userSchema = new Schema({
  email: { type: String, unique: true, lowercase: true },
  password: String
});

// On Save Hook, encrypt password
// Before saving a model, run this function
// userSchema.pre -> before being saved, run this function
userSchema.pre('save', function(next) {
  // get access to the user model
  const user = this;

  // generate a salt, then run callback
  bcrypt.genSalt(10, function(err, salt) {
    if (err) {
      return next(err);
    }

    // hash (encrypt) our password using the salt
    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) {
        return next(err);
      }

      // overwrite plain text password with encrypted password
      user.password = hash;
      next();
    });
  });
});

// Mongoose schema method for comparing passwords
userSchema.methods.comparePassword = function(candidatePassword, callback) {
  // 1. bcrypt takes the salt + hashed password and internally hashes candidatePassword
  // 2. hashed passwords are compares and callbacks are fired
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    // if an error occurs, return the error in the callback
    if (err) { return callback(err); }
    
    // otherwise, return null and the isMatch boolean indicating that the hashed passwords match
    callback(null, isMatch);
  });
}

// Create the model class
const model = mongoose.model('user', userSchema);

// Export the model
module.exports = model;
