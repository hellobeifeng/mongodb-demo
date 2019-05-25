var Comment = require('../models/comment');
var _ = require('lodash')

module.exports = {
    /**
     * 如果提交的是回复,commentObj:{movie,from,cid,content,tid} 将回复扔进某条评论的恢复列表里而不是单独保存
     * 如果提交的是评论，直接保存评论，commentOjb:{movie,from,content}
     * @param req
     * @param res
     */
    postNew: function (req, res) {
        var commentObj = req.body.comment;
        var movieId = commentObj.movie;

        if(commentObj.cid){ // 存在cid说明已经存在评论，本次是对评论的回复
            console.log('回复');
            Comment.findById(commentObj.cid,function(err,comment){
                var reply = {
                    from:commentObj.from, // 回复这条评论的用户
                    to:commentObj.tid,    // 发评论的人（注意区分，不是发回复的用户）
                    content:commentObj.content
                };
                comment.reply.push(reply);
                comment.save(function(err,comment){
                    if (err) console.log(err);
                    res.json({
                      title: '新增回复',
                      comment: comment
                    })
                })
            });
        } else{
            console.log('评论');
            var _comment = new Comment(commentObj);
            _comment.save(function (err, comment) {
                if (err) console.log(err);
                res.json({
                  title: '新增评论',
                  comment: comment
                })
            });
        }
    },
};
