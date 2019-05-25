## 一、基本指令
- 启动 mongodb
    - `mongod --config /usr/local/etc/mongod.conf`
    - `brew services start/stop mongodb`
- 进入mongodb命令行
    - mongo
- 显示数据库列表
    - show dbs
- 切换/创建dbname数据库
    - use dbname
    - 大小写敏感

## 二、集合操作
- 显示数据库中的集合
    - `show collections `
- 创建users集合
    - `db.createCollection('users')`
- 删除集合users
    - `db.users.drop()或db.runCommand({"drop","users"})`
- 删除当前数据库
    - `db.runCommand({"dropDatabase": 1})`


## 三、基本增删改查
### 3.1 创建&新增
- save()

    创建了名为users的集合，并新增了一条`{"name":"lecaf"}`的数据

        `db.users.save({"name":"lecaf"})`

- insert()

    在users集合中插入一条新数据，如果没有users这个集合，mongodb会自动创建

        db.users.insert({"name":"ghost", "age":10})


`save()`和`insert()`也存在着些许区别：若新增的数据主键已经存在，`insert()`会不做操作并提示错误，而`save()`则更改原来的内容为新内容。日不存在数据：`{ _id : 1, " name " : " n1 "}` ，`_id`是主键

- `insert({ _id : 1, " name " : " n2 " })`会提示错误
-` save({ _id : 1, " name " : " n2 " })`会把 n1 改为 n2(update的效果)

### 3.2 删除

- `db.users.remove()` | 删除users集合下所有数据
- `db.users.remove({"name": "lecaf"})` | 删除users集合下`name=lecaf`的数据

### 3.3 修改

`update(条件1, 条件2)`：第一个参数是查找条件，第二个参数是修改内容（主键不能删除）

- `db.users.update({"name":"aa"}, {"age":10})` | 修改`name`值为`aa`的那条数据数据，设置`age=10`


### 3.4 查找

- `db.users.find()` | 查找users集合中所有数据
- `db.users.find({“name”:”feng”})` | 查找users集合中name=feng的所有数据
- `db.users.findOne()` | 查找users集合中的第一条数据
- `db.users.find({“name”:"feng"}) `| 查找users集合中name=feng的数据集合中的第一条数据



## 四、高级应用
### 4.1 条件查找

- `db.collection.find({ "key" : value })`
    - 查找`key=value`的数据
- `db.collection.find({ "key" : { $gt: value }})`
    - `key > value`
- `db.collection.find({ "key" : { $lt: value }})`
    - `key < value`
- `db.collection.find({ "key" : { $gte: value }})`
    - `key >= value`
- `db.collection.find({ "key" : { $lte: value }})`
    - `key <= value`
- `db.collection.find({ "key" : { $gt: value1 , $lt: value2}})`
    - `value1 < key <value2`
- `db.collection.find({ "key" : { $ne: value }})`
    -  `key <> value`
- `db.collection.find({ "key" : { $mod : [ 10 , 1 ] } })`
    -  取模运算，条件相当于`key % 10 == 1`
- `db.collection.find({ "key" : { $nin: [ 1, 2, 3 ] } })`
    -  不属于集合中任何一个
- `db.collection.find({ "key" : { $in: [ 1, 2, 3 ] } })`
    -  属于中任何一个
- `db.collection.find({ "key" : { $size: 1 } })`
    -  key的值的数量是1（key必须是数组，一个值的情况不能算是数量为1的数组）
- `db.collection.find({ "key" : { $exists : true|false } })`
    -  `$exists`代表字段是否存在：true返回存在字段key的数据，false返回不存在字度key的数据
- `db.collection.find({ "key": /^val.*val$/i })`
    -  字符串正则，类似like；("i"忽略大小写，"m"支持多行)
- `db.collection.find({ $or : [{a : 1}, {b : 2} ] })`
    -  符合条件`a=1`的或者符合条件`b=2`的数据都会查询出来
- `db.collection.find({ "key": value , $or : [{ a : 1 } , { b : 2 }] })`
    -  符合条件`key=value`，同时符合其他两个条件中任意一个的数据
- `db.collection.find({ "key.subkey" :value })`
    -  内嵌对象中的值匹配，注意：`"key.subkey"`必须加引号
- `db.collection.find({ "key": { $not : /^val.*val$/i} })`
    -  这是一个与其他查询条件组合使用的操作符，不会单独使用。上述查询条件得到的结果集加上`$not`之后就能获得相反的集合。

### 4.2 排序

- `db.collection.find({}).sort({ "key1" : -1 ,"key2" : 1 })`
    - 这里的1代表升序，-1代表降序

### 4.3 其他

- `db.collection.find({}).limit(5)`
    - 控制返回结果数量，如果参数是0，则当作没有约束，`limit()`将不起作用
    - 会对传入参数求绝对值
    - 可用于分页, `limit`是`pageSize`
- `db.collection.find({}).skip(5)`
    - 控制返回结果跳过多少数量，如果参数是0，则当作没有约束，`skip()`将不起作用，或者说跳过了0条
    - 参数不能为负数,可用于分页,`skip` 是第`n`页`*pageSize`
- `db.collection.find({}).skip(5).limit(5)`
    - 可用来做分页，跳过5条数据再取5条数据
- `db.collection.find({}).count(true)`
    - count()返回结果集的条数
- db.collection.find({}).skip(5).limit(5).count(true)`
    - 在加入`skip()`和`limit()`这两个操作时，要获得实际返回的结果数，需要一个参数true，否则返回的是符合查询条件的结果，而不是数量
- findAndModify | 组合查询修改删除

        db.users.findAndModify({
            query: {age: {$gte: 25}},
            sort: {age: -1},
            update: {
                $set: {name: 'a2'},
                $inc: {age: 2}
            },
            remove: true
        });

