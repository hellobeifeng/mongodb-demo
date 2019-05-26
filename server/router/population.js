const express = require("express");
const router = express.Router();
const movieController = require("../controller/movie");
const categoryController = require("../controller/category");
const commentController = require("../controller/comment");
const userController = require('../controller/user')
/*
 * movie模型
 */
router.get('/movie/byCategory', movieController.all); //电影列表
router.post('/movie/new', movieController.postNew);//提交一部电影
router.post('/movie/update', movieController.postUpdate);//提交更新电影
router.get('/movie/list', movieController.list);//后台电影管理列表
router.get('/movie/delete/:id', movieController.delete);//删除一部电影
router.get('/movie/detail/:id', movieController.detail);//查看一部电影详情
router.get('/movie/search', movieController.search);//查询结果

/**
 * comment模型
 */
router.post('/comment/new', commentController.postNew);//提交一个评论
router.get('/comment/list', commentController.list); // 评论列表
/**
 * category模型
 */
router.post('/category', categoryController.postNew); // 提交一个评论
router.get('/category/list', categoryController.list); // 电影分类列表

/*
  * user模型
 */
router.post('/user/login', userController.postLogin);
router.post('/user/register', userController.userExist, userController.postRegister);
router.get('/user/list', userController.userList);

  module.exports = router;

