const { JWT_SECRET = '0633fd7b5a6d41c7bd04ceabf8764ddc9eef47886762154de071d0554fbded07' } = process.env;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ObjectForError } = require('../errors/errors');
const User = require('../models/user');

const newUser = (req, res, next) => {
  const { email, password, name } = req.body;
  bcrypt.hash(password, 10).then((hash) => {
    User.create({
      email,
      password: hash,
      name,
    })
      .then((user) => {
        res.send(user);
      })
      .catch(next);
  });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      res.send({
        token: jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' }),
      });
    })
    .catch((err) => {
      next(new ObjectForError('AccessDenied', err.message));
    });
};

const getUser = (req, res, next) => {
  const { _id } = req.user;
  User.findById(_id)
    .orFail()
    .then((user) => {
      res.send(user);
    })
    .catch(next);
};

module.exports = {
  newUser,
  login,
  getUser,
};
