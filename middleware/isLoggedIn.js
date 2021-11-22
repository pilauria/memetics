// checks if the user is logged in when trying to access a specific page

function isLoggedIn(req, res, next) {
  if (req.session.currentUser) {
    next();
  } else {
    res.redirect('/users/login');
  }
}

module.exports = isLoggedIn;
