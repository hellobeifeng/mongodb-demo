var Comment = require('../models/comment');
var _ = require('lodash')

module.exports = {
  list: function (req, res) {
    Comment.find({})
    .then(result => {
      res.json({
        title: "评论列表",
        data: result
      })
    })
    .catch(err => {
      res.json({
        title: "评论列表获取失败",
        data: err
      })
    })
  },
  // 评论结构
  // { movie: "5ce9165cea4f343c238f6dbd", from: "5ce8f3825bce8238a0f45205",  content: "我风少觉得求生之路很好看" }
  // 回复结构
  // "comment": {
  //   "movie": "5ce94519ac7b8a3eae481e86",
  //   "cid": "5cea5fcc17fab648b4b7a392",
  //   "from": "5ce8f1e2ca5d0b384ae05b89",
  //   "tid": "5ce8f1e2ca5d0b384ae05b89",
  //   "content": "我guide对admin说，你就是一头狼"
  // }
  postNew: function (req, res) {
    var commentObj = req.body.comment;
    // 存在cid说明已经存在评论，本次是对评论的回复
    if (commentObj.cid) {
      Comment.findById(commentObj.cid, function(err,comment) {
        var reply = {
          from: commentObj.from, // 回复这条评论的用户
          to: commentObj.tid,    // 发评论的人（注意区分，不是发回复的用户）
          content: commentObj.content
        };
        comment.reply.push(reply);
        comment.save(function(err,comment){
          if (err) {
            res.json({
              title: "评论列表获取失败",
              data: err
            })
          } else {
            res.json({
              title: '新增回复',
              comment: comment
            })
          }
        })
      });
    } else {
      var _comment = new Comment(commentObj);
      _comment.save(function (err, comment) {
        if (err) {
          res.json({
            title: "新增评论失败",
            data: err
          })
        } else {
          res.json({
            title: '新增评论',
            data: comment
          })
        }
      });
    }
  }
};
