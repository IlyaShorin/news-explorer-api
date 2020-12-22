const articlesRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { getArticles, newArticle, deleteArticle } = require('../controllers/articles');

articlesRouter.get('/', getArticles);
articlesRouter.post(
  '/',
  celebrate({
    body: Joi.object().keys({
      keyword: Joi.string().required(),
      title: Joi.string().required(),
      text: Joi.string().required(),
      date: Joi.string().required(),
      source: Joi.string().required(),
      link: Joi.string()
        .required()
        .pattern(/(http|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?/i),
      image: Joi.string()
        .required()
        .pattern(/(http|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?/i),
    }),
  }),
  newArticle,
);
articlesRouter.delete(
  '/:articleid',
  celebrate({
    body: Joi.object().keys({
      articleid: Joi.string().hex().length(24),
    }),
  }),
  deleteArticle,
);

module.exports = { articlesRouter };
