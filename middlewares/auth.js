const jwt = require('jsonwebtoken');
const { ObjectForError } = require('../errors/errors');

const { JWT_SECRET = '0633fd7b5a6d41c7bd04ceabf8764ddc9eef47886762154de071d0554fbded07' } = process.env; // записать секрет

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (authorization) {
    if (!authorization || !authorization.startsWith('Bearer ')) {
      next(new ObjectForError('NotAutorisation'));
    }

    const token = authorization.replace('Bearer ', '');
    let payload;

    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      next(err);
    }

    req.user = payload;
  } else {
    throw new ObjectForError('NotAutorisation');
  }
  next();
};
