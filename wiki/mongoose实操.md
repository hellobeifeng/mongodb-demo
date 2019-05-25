# 实操笔记
## 表相关
### 新建表
新建了`schema/model`之后，并不会立刻在`mongodb`中创建表结构，但是如果执行了创建实例的操作之后，Mongodb数据库中会新增表并新增一行

### 默认表名和指定表名

通过下方这种不指定`schema`名字的模式的表
    
    const mongoose = require('mongoose')
    const studentSchema = mongoose.Schema({
      name :String,
      age : String,
      sex : String,
      address : String
    })

    module.exports = mongoose.model('stuent',studentSchema)
    
在`mongodb`中默认会给`model`的名字追加复数形式，比如上文中的`student`实际看到的表名是`students`,而如果使用

    module.exports = mongoose.model('stuents',studentSchema)

因为本身`students`名字就是复数形式，所以实际上的表名就是`student`。但是如果使用
    
    module.exports = mongoose.model('stuentss',studentSchema)
    
因为使用了`ss`这种结尾，所以实际的表名是`studnetsses`
    
是不是很绕？所以为了严谨起见，强烈推荐创建`schema`的时候就指定表名，防止系统自动设置名字造成困扰，比如：
    
    const mongoose = require('mongoose')
    const studentSchema = mongoose.Schema({
      name :String,
      age : String,
      sex : String,
      address : String
    }, { collection: 'student'})
    

这个时候，无论使用`module.exports = mongoose.model('xxx',studentSchema);`还是`module.exports = mongoose.model('students',studentSchema);`,都不会影响实际的表名（`student`）

### 已有表结构添加新字段

对于一个已经存在的表结构：

    const studentSchema = mongoose.Schema({
      name :String, age : String, sex : String, address : String
    })
    
如果想给所有实例增加新字段，比如

    const studentSchema = mongoose.Schema({
      name :String, age : String, sex : String, address : String,
      newKey: String
    })
    
这样做是不够的，只能让新保存的实例结构中存在`newKey`字段，如果想给表中所有实例增加新字段，需要先执行如下操作

      Student.update({}, { $set: { newKey: "" }}, { multi: true })
        .then(student => res.send(`新增newKey成功`))
        .catch(err => res.json(err));

这个操作会让所有的已有实例新增`newKey`字段，也可以使用限制条件

    Student.update({"componentsPermission":  { $exists: true } }, { $set: { newKey: "" }}, { multi: true })
    
> 要保证现在表结构中增加字段newKey

## 运维相关

### 主从数据库的配置
### 数据库权限
### 数据库的安装和维护
### 数据库工具