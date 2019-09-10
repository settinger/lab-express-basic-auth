'use strict';

const { Router } = require('express');
const router = Router();
const bcrypt = require('bcryptjs');

// Import user model
const User = require('../models/user');

// Middleware that checks for authentication and prevents unauthorized users from reaching authorized zones
// Check for session.user cookie being set; redirect to login if it is not set
// Otherwise, pass off to next middleware
const checkAuthorization = (req, res, next) => {
  if (!req.session.user) {
    res.redirect('/auth/signin');
  } else {
    next();
  }
};

/* GET REQUESTS */
// Sign-up page
router.get('/signup', (req, res, next) => {
  res.render('auth/signup', {title: "New user registration"});
});

// Sign-in page
router.get('/signin', (req, res, next) => {
  res.render('auth/signin', {title: "Existing user sign-in"});
});

// Private page for logged-in users
router.get('/private', checkAuthorization, (req, res, next) => {
  res.render('auth/private', {title: "PRIVATE PAGE"});
});

// Another private page for logged-in users
router.get('/main', checkAuthorization, (req, res, next) => {
  res.render('auth/main', {title: "PRIVATE PAGE"});
});



/* POST REQUESTS */
// Sign-up page (a form should submit a request containing an email and password)
router.post('/signup', (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  // hash the password immediately (bcrypt handles the salting)
  bcrypt.hash(password, 10)
    .then(hash => {
      return User.create({
        email: email,
        passwordHash: hash
      });
    })
    .then(user => {
      // Send user ID as cookie so we can check for log-in status later
      req.session.user = { _id: user._id };
      res.redirect('/auth/private');
    })
    .catch((err) => {
      console.log(`Error creating user: ${err}`);
      res.render('auth/signup', { errorMessage: err.message });
    });
});


// Sign-in page (a form should submit a request containing an e-mail and password)
router.post('/signin', (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  // Instantiate an auxiliary user object for comparison purposes
  let tempUser;

  // Find user by e-mail (guaranteed to be unique)
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        throw new Error('USER_NOT_FOUND');
      } else {
        tempUser = user;
        return bcrypt.compare(password, user.passwordHash);
      }
    })
    // Check the result of the bcrypt comparison
    .then((comparison) => {
      if (!comparison) {
        throw new Error('PASSWORDS_DO_NOT_MATCH');
      } else {
        // User is logged in! Set a cookie to keep them logged in, redirect them to the /private page.
        req.session.user = { _id: tempUser._id };
        res.redirect('auth/private');
      }
    })
    .catch((err) => {
      console.log(`Error checking user password: ${err}`);
      res.render('auth/signin', { errorMessage: err.message })
    });
});


// Sign-out button (A form sends a signout POST request)
router.post('/signout', (req, res, next) => {
  // Remove user-signed-in cookie
  req.session.destroy();
  // Redirect to the home page
  res.redirect('/');
})



module.exports = router;