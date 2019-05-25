
var User = require('../models/user');
var hash = require('../utils/pass').hash;
/**
 * 身份验证函数：首先验证用户是否存在，然后验证用户密码是否正确
 * 表单密码+用户salt生成hash，然后对照用户模型中的user.hash
 */
function authenticate (name, pass, fn) {
  User.findOne({ username: name }, function (err, user) {
    if (user) {
      hash(pass, user.salt, function (err, hash) {
        if (err) return fn(err);
        if (hash == user.hash) return fn(null, user);
        fn(new Error('invalid password'));
      });
    } else {
      return fn(new Error('cannot find user'));
    }
  });
}
module.exports = {
  // 判断用户是否存在
  userExist: function (req, res, next) {
    let name = req.body.user.username
    User.findOne({ username: name }, function (err, user) {
      if (user) {
        res.json({
          title: '用户已存在',
          data: user
        })
      } else {
        console.log('success');
        next();
      }
    });
  },
  /**
   * 登录验证函数
   * 首先 调用authenticate()函数，根据用户名和密码验证hash值
   * 跟注册相比，省略了先调用Hasn()生成hash再保存User模型的过程
   * 因为此处是登录环节，已经默认有name了，直接用name查user
   * @param req
   * @param res
   */
  postLogin: function (req, res) {
    var userObj = req.body.user;
    var username = userObj.username;
    var password = userObj.password;

    authenticate(username, password, function (err, user) {
      if (user) {
        res.json({
          title: '登录成功',
          data: user
        })
      } else{
        res.json({
          title: '登录失败',
          data: {}
        })
      }
    });
  },
  /**
   * 注册提交模块
   * 数据库不保存明文密码
   * 首先 hash(password)生成salt,和用盐和密码执行has后的hash值
   * 其次 根据name,salt,hash保存用户模型
   * 最后 调用authenticate()函数验证哈希值是否正确
   * @param req
   * @param res
   */
  postRegister: function (req, res) {
    var userObj = req.body.user;
    hash(userObj.password, function (err, salt, hash) {
      if (err) console.log('here' + err);
      new User({
        username: userObj.username,
        salt,
        hash
      }).save(function (err, newUser) {
        if (err) throw err;
        authenticate(newUser.username, userObj.password, function (err, user) {
          if (user) {
            res.json({
              title: '注册用户',
              data: user
            })
          }else{
            res.json({
              title: '注册失败',
              data: err
            })
          }
        });
      });
    });
  },
  userList:function(req,res) {
    User.fetch(function(err,users){
      if(err){
        console.log(err);
      }
      res.json({
        title: '用户列表',
        data: users
      })
    })
  }
};
