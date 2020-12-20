require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { celebrate, Joi, errors } = require('celebrate');
const cors = require('cors');
const auth = require('./middlewares/auth');
const { newUser, login } = require('./controllers/users');
const router = require('./routes/index');
const { ObjectForError } = require('./errors/errors');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { limiter } = require('./middlewares/limiter');

const { PORT = 3000 } = process.env;
const app = express();
app.use(
  '*',
  cors({
    origin: 'https://mestoapp.students.nomoredomains.rocks',
  })
);
app.use(helmet());
mongoose.connect('mongodb://localhost:27017/newsexplorerdb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(requestLogger);
app.set('trust proxy', 1);
app.use(limiter);
app.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required().trim(),
      name: Joi.string().min(2).max(30),
    }),
  }),
  newUser
);
app.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }),
  login
);

app.use(auth);
app.use('/', router);
app.use('*', (req, res, next) => {
  next(new ObjectForError('ObjectNotFound', 'Страница не найдена'));
});
app.use(errorLogger);
app.use(errors());
app.use((err, req, res, next) => {
  console.log(err.name, err.message, err.code);
  switch (err.name) {
    case 'MongoError':
      if (err.code === 11000) {
        res.status(409).send({ message: 'Данный email уже зарегистрирован' });
      } else {
        res.status(500).send({ message: 'Ошибка в БД' });
      }
      break;
    case 'Forbidden':
      res.status(403).send({ message: 'Нет доступа' });
      break;
    case 'ValidationError':
      res.status(400).send({ message: 'Переданы некорректные данные' });
      break;
    case 'CastError':
      res.status(400).send({ message: 'Передан некорректный id' });
      break;
    case 'ObjectNotFound':
      res.status(404).send({ message: err.message });
      break;
    case 'DocumentNotFoundError':
      res.status(404).send({ message: 'Объект не найден' });
      break;
    case 'NotAutorisation':
      res.status(401).send({ message: 'Необходима авторизация' });
      break;
    case 'LoginFailed':
      res.status(401).send({ message: 'Неверное имя или пароль' });
      break;
    case 'JsonWebTokenError':
      res.status(400).send({ message: 'Передан некорретный токен' });
      break;
    case 'AccessDenied':
      res.status(401).send({ message: err.message });
      break;
    default:
      res.status(500).send({ message: 'Внутренняя ошибка сервера' });
  }
  next();
});
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
