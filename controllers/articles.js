const Article = require('../models/article');
const { ObjectForError } = require('../errors/errors');

const getArticles = (req, res, next) => {
  const owner = req.user._id;
  Article.find({ owner })
    .then((article) => {
      res.send(article);
    })
    .catch((err) => {
      next(err);
    });
};
const newArticle = (req, res, next) => {
  const {
    keyword, title, text, date, source, link, image,
  } = req.body;
  const { _id } = req.user;
  Article.create({
    keyword, title, text, date, source, link, image, owner: _id,
  })
    .then((article) => {
      res.send(article);
    })
    .catch((err) => {
      next(err);
    });
};
const deleteArticle = (req, res, next) => {
  const { _id } = req.user;
  Article.findArticleWithOwner(req.params.articleid)
    .then((article) => {
      if (!article) {
        throw new ObjectForError('ObjectNotFound', 'Статья не найдена');
      }
      if (article.owner.toString() === _id) {
        Article.findByIdAndRemove(req.params.articleid)
          .orFail()
          .then((data) => {
            res.send(data);
          });
      } else {
        throw new ObjectForError('Forbidden');
      }
    })
    .catch((err) => {
      next(err);
    });
};
module.exports = {
  getArticles,
  newArticle,
  deleteArticle,
};
