var Category = require('../models/category')

module.exports = {
  postNew: function (req, res) {
    var categoryObj = req.body.category || {};
    var _category = new Category(categoryObj);
    _category.save(function (err, category) {
      if (err) console.log(err);
      res.json({
        title: '新增一个电影分类',
        data: category
      })
    });
  },
  list: function (req, res) {
    Category.fetch(function (err, categories) {
      if (err) return;
      res.json({
        title: '电影分类列表',
        data: categories || []
      })
    })
  }
};
