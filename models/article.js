const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
  {
    keyword: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
      validate: {
        validator(v) {
          return /(http|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?/i.test(v);
        },
        message: 'Введите URL',
      },
    },
    image: {
      type: String,
      required: true,
      validate: {
        validator(v) {
          return /(http|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?/i.test(v);
        },
        message: 'Введите URL',
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
      select: false,
    },
  },
  { versionKey: false },
);
articleSchema.statics.findArticleWithOwner = function (articleid) {
  return this.findById(articleid)
    .select('+owner')
    .then((article) => article);
};
articleSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.owner;
  return obj;
};
module.exports = mongoose.model('article', articleSchema);
