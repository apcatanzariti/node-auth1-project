const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { add, findBy } = require('./../users/users-model');
const { checkUsernameFree, checkPasswordLength, checkUsernameExists } = require('./auth-middleware');

// Require `checkUsernameFree`, `checkUsernameExists` and `checkPasswordLength`
// middleware functions from `auth-middleware.js`. You will need them here!


/**
  1 [POST] /api/auth/register { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "user_id": 2,
    "username": "sue"
  }

  response on username taken:
  status 422
  {
    "message": "Username taken"
  }

  response on password three chars or less:
  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
 */

  router.post('/register', checkUsernameFree, checkPasswordLength, (req, res) => {
    const { username, password } = req.body;
  
    const hash = bcrypt.hashSync(password, 10);
  
    const userForDatabase = { username, password: hash };
  
    add(userForDatabase)
    .then(newUser => {
      res.status(200).json(newUser);
    })
    .catch(err => {
      res.status(500).json({ message: 'something went wrong adding this user' });
    })
  });

/**
  2 [POST] /api/auth/login { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "message": "Welcome sue!"
  }

  response on invalid credentials:
  status 401
  {
    "message": "Invalid credentials"
  }
 */

  router.post('/login', checkUsernameExists, checkPasswordLength, (req, res) => {
    const { username, password } = req.body;

    findBy(username).first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        req.session.user = user;
        res.status(200).json(`Welcome ${username}!`);
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    })
    .catch(err => {
      res.status(500).json({ message: 'something went wrong logging in' });
    })
  });



/**
  3 [GET] /api/auth/logout

  response for logged-in users:
  status 200
  {
    "message": "logged out"
  }

  response for not-logged-in users:
  status 200
  {
    "message": "no session"
  }
 */

 
// Don't forget to add the router to the `exports` object so it can be required in other modules

module.exports = router;