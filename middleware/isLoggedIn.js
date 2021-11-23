// checks if the user is logged in when trying to access a specific page

function isLoggedIn(req, res, next) {
  if (!req.session.currentUser) {
    res.redirect('/users/login');
  } else {
    next();
  }
}

module.exports = isLoggedIn;
