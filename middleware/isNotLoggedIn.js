// if an already logged in user tries to access the login page it
// redirects the user to the home page

function isNotLoggedIn(req, res, next) {
  if (req.session.currentUser) {
    res.redirect('/private/profile');
  } else {
    next();
  }
}

module.exports = isNotLoggedIn;
