const Authentication = require('./controllers/authentication');
const passportService = require('./services/passport');
const passport = require('passport');

// requireAuth - Make authenticated requests
const requireAuth = passport.authenticate('jwt', { session: false });

// requireSignin - Authenticate the user and provide a token for authenticated requests
const requireSignin = passport.authenticate('local', { session: false });

module.exports = function(app) {
  app.get('/', requireAuth, function(req, res) {
    res.send({ hi: 'there' });
  });
  app.post('/signin', requireSignin, Authentication.signin);
  app.post('/signup', Authentication.signup);
}
