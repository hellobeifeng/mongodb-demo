const express = require("express");
const router = express.Router();
const StudentController = require("../controller/student");

router.get("/student", StudentController.findAll) // 用户列表
router.get("/student/:id", StudentController.findById) // 用户详情
router.post("/student", StudentController.AddPerson) // 新增用户
router.put("/student/:id", StudentController.updateById) // 更改用户
router.delete("/student/:id", StudentController.delById) // 删除用户
router.get("/student/tool/addNewKey", StudentController.addNewKeyForSchema)
router.get('/student/tool/querySomeKey', StudentController.querySomeKey) // 只返回部分参数
router.get('/student/tool/chainFuncTest', StudentController.chainFuncTest)
router.get('/student/tool/setOneKeyType', StudentController.setOneKeyType)
router.get('/student/tool/setOneKeyByKey', StudentController.setOneKeyByKey)
router.get('/student/tool/tryStasticFetch', StudentController.tryStasticFetch)
router.get('/student/tool/tryStasticFindByName', StudentController.tryStasticFindByName)

module.exports = router;
