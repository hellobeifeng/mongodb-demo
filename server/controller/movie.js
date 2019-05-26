var Movie = require('../models/movie');
var Comment = require('../models/comment')
var Category = require('../models/category')
var _ = require('lodash')

module.exports = {
  // 重点关注：通过 populate方式，一次性将关联的表字段查出来
  all: function (req, res) {
    Category
      .find({})
      // 什么也不做，则最终categorys的每一项都有一个movies数组属性，其中每一项保存着关联的所有分类下每一个movie _id属性
      // .populate('movies', 'title') // 使用这种暗访时，则则最终categorys的每一项都有一个movies数组属性，其中每一项保存着关联的所有分类下每一个movie _id属性和特定筛选出的title属性
      .populate({ path: 'movies', options: { limit:5 }}) // 最终categorys中的每一项都有一个movies数组属性，其中每一项保存着关联的所有分类下每一个movie的全部属性
      .exec(function (err, categories) {
        if (err) {
          console.log('##err', err)
        } else {
          res.json({
            title: '电影首页,每个分类显示五个电影',
            data: categories
          })
        }
      })
  },
  // 新增电影
  // 现有分类传参
  // {
  //   "movie": {
  //     "category": "5ce8f60ffedacf3916ba1e8e",
  //     "title": "末日求生3"
  //   }
  // }
  postNew: function (req, res) {
    var movieObj = req.body.movie;
    var categoryName = movieObj.categoryName; // 新增的自定义分类名称的字段（movie schema中没有对应的属性）
    var categoryId = movieObj.category; // 从项目中原有的分类字段中选择的一项作为当前 movie 的分类

    var _movie = new Movie(movieObj);

    // 现有分类下新增电影
    if(categoryId) {
      _movie.save(function (err, movie) {
        if (err) console.log(err);
        Category.findById(categoryId, function(err, category){
          category.movies.push(movie._id);
          // 查询实例调用 save() 方法
          category.save(function(err){
              if (err) console.log(err);
              res.json({
                title: '原有分类新增电影',
                data: {
                  category,
                  movie
                }
              });
          })
        })
      });
    } else if(categoryName) { // 新分类下的新电影
      _movie.save(function (err, movie) {
        if (err) console.log(err);

        var categoryObj = new Category({
          name : categoryName,
          movies: [movie._id]
        });

        // 查询实例调用 save() 方法
        categoryObj.save((err, category) => {
          movie.category = category._id;
          movie.save((err, movie) => {
            res.json({
              title: '新增分类和电影',
              data: {
                category,
                movie
              }
            })
          })
        });
      });
    } else {
      res.json({
        msg: "接口异常"
      })
    }
  },
  // 删除电影，同时将分类中的电影删掉
  delete: function (req, res) {
    var id = req.params.id;
    if (!id) {
      res.json({
        title: "删除失败，id不能为空",
        data: {}
      })
    }

    Movie.findOne({_id: id})
    .then(movie => {
      let delObj = {
        movieId: movie._id,
        categoryId: movie.category
      }
      return delObj
    })
    .then(obj => {
      Category.findOne({_id: obj.categoryId})
      .then(category => {
        _.remove(category.movies, item => item == obj.movieId)
        category.save(function (err, category) {
          if (err) {
            res.json({
              title: "从分类中删除电影失败"
            })
          } else {
            Movie.remove({_id: obj.movieId}, function (err, movie) {
              if (err) {
                console.log(err)
              } else {
                res.json({
                  title: "删除成功",
                  movie
                })
              }
            })
          }
        })
      })
    })
    .catch(err => {
      res.json({
        title: '删除失败',
        data: err
      })
    })
  },
  detail: function (req, res) {
    /**
     * populate方法
     * 如果如下函数中不使用populate('from','username'),则from字段仅保存一个user对象的_id字段值（from: 568e1ca039b2f528168f9d43）
     *
     * 然而，一旦使用了populate('from','username'),则from字段就自动提升为了一个user对象，同时拥有了username属性from: { meta: {}, username: 'admin', _id: 568e1ca039b2f528168f9d43 }
     * 所以需要什么字段，就可以通过populate的方法，将引用Schema中的字段放入当前from中
     */
    var id = req.params.id;
    Movie.findById(id, function (err, movie) {
      Comment
        .find({movie: id})
        .populate('from', 'username')//将from指向的User文档中的username属性提取到当前的from对象中，前端直接使用from.username
        .populate('reply.from reply.to', 'username')
        .exec(function (err, comments) {
            /*
               comments ->
               { reply: [],
               meta:
               { createAt: Sun Jun 12 2016 23:13:12 GMT+0800 (中国标准时间),
               updateAt: Sun Jun 12 2016 23:13:12 GMT+0800 (中国标准时间) },
               __v: 0,
               content: 'ffff',
               from: { meta: {}, username: 'feng', _id: 5688a75f75f1ba400e48719f },
               movie: 57598f5dbba76e840579344d,
               _id: 575d7c08fd819a9419ea3d20 }
             */
          res.json({
            title: '电影详情',
            movie: movie,
            comments: comments
          })
        });
    })
  },
  postUpdate: function (req, res) {
    var id = req.body.movie._id;
    var movieObj = req.body.movie;
    var _movie;
    Movie.findById(id, function (err, movie) {
      if (err) console.log(err);
      _movie = _.extend(movie, movieObj);
      _movie.save(function (err, movie) {
        res.json({
          title: '更新电影',
          movie: movie
        })
      })
    })
  },
  list: function (req, res) {
    Movie.fetch(function (err, movies) {
      if (err) return;
      res.json({
        title: '电影列表',
        movies: movies
      })
    })
  },
  search: function (req, res) {
    var catId = req.query.cat;
    var page = parseInt(req.query.p) || 0;//当前页码
    var count = 2;//每页多少数据
    var index = page * 2;//起始值
    var q = req.query.q;//搜索输入值

    if(catId) {
      Category.find({_id: catId})
          .populate({
            path: 'movies',
            select: 'title' // 引用movies的数据，选出title 数据；关联整个对象，取出某几个值 ？？ 换成上面的{movies title}试试
          })
          .exec(function(err, categories) {
            if(err) console.log(err);
            /*
             console.log(categories)
             [ {
                movies:[ {
                  meta: {},
                  poster: 'https://img1.doubanio.com/view/movie_poster_cover/lpst/public/p494268647.jpg',
                  title: '机器人9号',
                  _id: 5755944f8efb473011d4391b
                } ],
              meta: {
                createAt: Mon Jun 06 2016 22:24:54 GMT+0800 (中国标准时间),
                updateAt: Mon Jun 06 2016 23:18:39 GMT+0800 (中国标准时间) },
                __v: 1,
                name: '战争题材',
              _id: 575587b6ba60610c0a58b889 } ]
            */
            var category = categories[0] || {};
            var movies = category.movies || [];
            var results = movies.slice(index, index + count);

            res.json({
              title: '搜索列表',
              data: {
                movies: results,
                currentPage: page + 1,
                query: 'cat=' + catId,
                totalPage: Math.ceil(movies.length / count),
                keyword: category.name
              }
            })
          })
    } else {
      Movie
        .find({title: new RegExp(q + '.*','i')})
        .exec(function(err, movies){
          if(err) console.log(err);
          var results = movies.slice(index, index + count);

          res.json({
            title: '搜索列表',
            data: {
              movies: results,
              currentPage: page + 1,
              query: 'q=' + q,
              totalPage: Math.ceil(movies.length / count),
              keyword: q
            }
          })
        })
    }

  }
};
