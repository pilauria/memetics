var express = require('express');

var logger = require('morgan');

const cookieParser = require('cookie-parser');

const favicon = require('serve-favicon');

const path = require('path');

const session = require('express-session');
const MongoStore = require('connect-mongo');

const hbs = require('hbs');

// Middleware configuration
module.exports = app => {
  // In development environment the app logs
  app.use(logger('dev'));

  // To have access to `body` property in the request
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());

  // Normalizes the path to the views folder
  app.set('views', path.join(__dirname, '..', 'views'));
  // Sets the view engine to handlebars
  app.set('view engine', 'hbs');

  hbs.registerPartials(path.join(__dirname, '..', '/views/partials'));

  // Handles access to the public folder
  app.use(express.static(path.join(__dirname, '..', 'public')));

  // Handles access to the favicon
  app.use(
    favicon(path.join(__dirname, '..', 'public', 'images', 'favicon.ico'))
  );

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000,
      },
      store: MongoStore.create({
        mongoUrl:
          'mongodb+srv://pilauria:CtbSHUys2yPQlyxW@cluster0.q3aua.mongodb.net/project2-team',
      }),
    })
  );
};
