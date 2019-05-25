## 一、前言
 Mongoose 库简而言之就是对 node 环境中 MongoDB 数据库操作的封装，一种对象模型工具，可以将数据库中的数据转换为 JavaScript 对象供我们使用。

### mongodb && mongodb && oracle


|Oracle	|MongoDB	|Mongoose|
| :---: | :---: | :---: |
|数据库实例(database instance)	|MongoDB实例	|Mongoose|
|模式(schema)	|数据库(database)	|mongoose|
|表(table)	|集合(collection)	|模板(Schema)+模型(Model)|
|行(row)	|文档(document)	|实例(instance)|
|rowid	|_id	|_id|
|Join	|DBRef	|DBRef|


### understand mongoose

通过上面的阐述,我们大概能知道了在Mongoose里面有哪几个基本概念.

- `Schema`: 相当于一个数据库的模板. Model 可以通过`mongoose.model` 集成其基本属性内容. 当然也可以选择不继承
- `Model`: 基本文档数据的父类,通过集成`Schema`定义的基本方法和属性得到相关的内容
- `instance`: 这就是实实在在的数据了. 通过 `new Model()`初始化得到



## 二、模式&模型
### 2.1 Schema（模式）

一种以文件形式存储的数据库模型骨架，不具备数据库的操作能力，仅仅只是一段代码，无法通往数据库端, 仅仅只是数据库模型在程序片段中的一种表现

    var BlogSchema = new Schema({
      title:String,
      author:String
    });

#### 2.1.1 Schema.Type
`Schema.Type`是由`Mongoose`内定的一些数据类型，基本数据类型都在其中，Mongoose 也内置了一些特有的`Schema.Type`

    var ExampleSchema = new Schema({
      name:String,
      binary:Buffer,
      living:Boolean,
      updated:Date,
      age:Number,
      mixed:Schema.Types.Mixed, //该混合类型等同于nested
      _id:Schema.Types.ObjectId,  //主键
      _fk:Schema.Types.ObjectId,  //外键
      array:[],
      arrOfString:[String],
      arrOfNumber:[Number],
      arrOfDate:[Date],
      arrOfBuffer:[Buffer],
      arrOfBoolean:[Boolean],
      arrOfMixed:[Schema.Types.Mixed],
      arrOfObjectId:[Schema.Types.ObjectId]
    });

#### 2.1.2 验证规则

    var PersonSchema = new Schema({
      name:{
        type:'String',
        required:true //姓名非空
      },
      age:{
        type:'Nunmer',
        min:18,       //年龄最小18
        max:120     //年龄最大120
      },
      city:{
        type:'String',
        enum:['北京','上海']  //只能是北京、上海人
      },
      other:{
        type:'String',
        validate:[validator,err]  //validator是一个验证函数，err是验证失败的错误信息
      }
    });


- 问题集合
    - 新建属性后如何生效
    - 新建表的标明如何设置的（自动加上了s）

### 2.2 Model

#### 2.2.1 基本概念
`Model`(模型)，是经过`Schema`构造来的编译版本。一个`Model`的实例直接映射为数据库中的一个文档。基于这种关系,以后的增删改查都要通过这个`Model`实例实现。

    //先创建Schema
    var UserSchema = new Schema({
      name:'String',
      sex:'String'
    });
    //通过Schema创建Model
    var UserModel = mongoose.model('User',UserSchema );

#### 2.2.2 model的创建 

关于model的创建,有两种方法, 一种是使用实例创建,另外一种是使用Model类创建

    // 使用实例创建
    var Tank = mongoose.model('Tank', yourSchema);
    var small = new Tank({ size: 'small' });
    small.save(function (err) {
      if (err) return handleError(err);
      // saved!
    })

    // 使用Model类创建
    var Tank = mongoose.model('Tank', yourSchema);
    Tank.create({ size: 'small' }, function (err, small) {
      if (err) return handleError(err);
      // saved!
    })
    
另外,官方给出一个提醒: 由于`mongoose`会自身连接数据库并断开. 如果你手动连接, 则创建`model`的方式需要改变.

    // 自己并没有打开连接(注意,这里只是连接,并没有创建connection)
    mongoose.connect('mongodb://localhost:27017/test'); 
    
    //手动创建连接:
    var connection = mongoose.createConnection('mongodb://localhost:27017/test');
    var Tank = connection.model('Tank', yourSchema);
    var small = new Tank({ size: 'small' });
    //使用实例创建
    small.save(function (err) {
      if (err) return handleError(err);
      console.log('创建成功');
    })

> 一般都是默认创建，所以使用 `Model.create()` 方式创建实例，这种情况要注意使用`Model.save()`是失败的

### 2.3 一次完整的使用流程

#### 2.3.1 安装文件 && 引入依赖

    npm install mongoose --save

    var mongoose = require("mongoose")
    mongoose.connect('mongodb://localhost/testDataBase');

#### 2.3.2 定义schema

这里我们定义一个userSchema.js文件

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;

    var UserSchema = new Schema({
      uid: {
        type: String,
        required: true,
        unique: true
      },
      logLevel: {
        type: String,
        default: 'info'
      },
      meta: {
        createAt: {
          type: Date,
          default: Date.now()
        },
        updateAt: {
          type: Date,
          default: Date.now()
        }
      }
    });

    UserSchema.pre('save', function (next) {
      if (this.isNew) {
        this.meta.updateAt = this.meta.createAt = Date.now();
      } else {
        this.meta.updateAt = Date.now();
      }
      next()
    });

    UserSchema.statics = {
      fetch: function (cb) {
        return this.find({})
          .sort('meta.createAt')
          .exec(cb)
      },
      findById: function (id, cb) {
        return this.findOne({_id: id})
          .sort('meta.createAt')
          .exec(cb);
      },
      findByUid: function (uid, cb) {
        return this.findOne({uid: uid})
          .sort('meta.createAt')
          .exec(cb);
      }
    };

    module.exports = UserSchema;

#### 2.3.3 将schema发布为Model

这里我们定义一个`userModule.js`文件。用于引用`schema`，发布为`model`，向外导出。

    var mongoose = require('mongoose');
    var UserSchema = require('./userSchema');

    var User = mongoose.model('User',UserSchema);
    module.exports = User;

#### 2.3.4 增删改查

在`controller`层引入这个`model`实例，就可以使用之前定义的静态方法了。这`个model`还拥有`Model.create()，Model.find()，Model.update()，Model.remove()`方法,进行基本的CURD操作, 比如：

    var _ = require('underscore');
    var User = require('../models/user');

    module.exports = {
      //  通过实例化model，创建一个model实例
      add: function(req, res, next) {
        var _user = new User(req.body.user); //相当于调用了Model.create(req.body)
        _user.save(function (err, user) {
          if (err) {
            //doSomething...
          } else {
            //doSomething...
          }
        })
      },
      delete: function (req, res) {
        var id = req.query._id;

        User.remove({_id: id}, function (err) {
          if (err) {
            //doSomething...
          } else {
            //doSomething...
          }
        })
      },
      update: function (req, res) {

        var id = req.body.id;
        var userParams = req.body;

        User.findById(id, function (err, user) {
          if (err) {
            //doSomething...
          } else {
            _user = _.extend(user, userParams);
            _user.save(function (err, user) {
              if(err) {
                //doSomething...
              } else {
                //doSomething...
              }
            })
          }
        })
      },
      list: function (req, res) {
        User.fetch(function (err, users) {
          var resultUsers=_.map(users, function(user){
          if (err){
            //doSomething...
          } else {
            //doSomething...
          }
        })
      },
    };


## 三、API

### 3.1 查询

在mongoose中,query数据 提供了两种方式.

#### 3.1.1 callback

使用回调函数即, query会立即执行,然后返回到回调函数中

    Student.find({}, "name sex", function(err, result) {
        if (err) res.json(err)
        res.send(result)
    })
  
或者使用 `promise` 也是同理    
    
    Student.find({}, "name sex")
      .then(result => {
        console.log('##result', result)
        res.send(result)
      })
      .catch(err => res.json(err));
    
两者只是换了一种写法，本质上都是对一次查询的立刻执行
    
#### 3.1.2 query

使用查询方法,返回的对象。该对象是一个`Promise`, 所以可以使用 `chain` 进行调用。最后必须使用`exec(cb)`传入回调进行处理`cb`(第一个参数永远是err. 第二个就是返回的数据)
    
    Person.
      find({
        occupation: /host/,
        'name.last': 'Ghost',
        age: { $gt: 17, $lt: 66 },
        likes: { $in: ['vaporizing', 'talking'] }
      }).
      limit(10).
      sort({ occupation: -1 }).
      select({ name: 1, occupation: 1 }).
      exec(callback);
    
    > 只有在执行`exec`方法时才执行查询，而且必须有回调


### 3.3 删除

    Hero.findOneAndRemove({  _id: req.params.id }).then().catch()

### 3.4 修改

    Model.update(conditions, doc, [options], [callback])

- `conditions`: 就是`query`. 通过`query`获取到指定`doc`
- `doc`: 就是用来替换`doc`内容的值.
- `options`: 
    - `safe (boolean)` 是否开启安全模式 (`default for true`)
    - `upsert (boolean)` 如果没有匹配到内容,是否自动创建 ( `default for false`)
    - `multi (boolean)` 如果有多个`doc`,匹配到,是否一起更改 ( `default for false`)
    - `strict (boolean)` 使用严格模式(`default for false`)
    - `overwrite (boolean)` 匹配到指定`doc`,是否覆盖 (`default for false`)
    - `runValidators (boolean)`: 表示是否用来启用验证. 篇(`default for false`)

大概的格式如下：

    Model.update({age:18}, { $set: { name: 'jason borne' }}, {multi:true}, function (err, raw) {
      if (err) return handleError(err);
      console.log('raw 就是mongodb返回的更改状态的falg ', raw);
      //比如: { ok: 1, nModified: 2, n: 2 }
    });
    

### 3.5 新增

    Hero.create(req.body, (err, hero) => {
        if (err) {
          res.json(err);
        } else {
          res.json(hero);
        }
    });

## 四、方法

mongoose 有许多有趣的方法定义，针对下方的结构，我们来演练一下各类方法的定义

    // models/student.js
    const studentSchema = mongoose.Schema({
      name :String,
      age : Number,
      sex : String,
      address : String,
      newKey: String,
      newKey1: String,
      meta: {
        createAt: {
            type: Date,
            default: Date.now()
        },
        updateAt: {
            type: Date,
            default: Date.now()
        }
      }
    }, { collection: 'student'})
    
    // 下文追加代码处
    
    module.exports = mongoose.model('student',studentSchema);

### 4.1 stastic

`statics`方法可以在 Model 级别直接调用，比如在上方`schema`文件中增加如下代码

    studentSchema.statics = {
      fetch: function (cb) {
        return this.find({})
          .sort('meta.updateAt')
          .exec(cb)
      },
      findByName: function (name, cb) {
        return this.findOne({name: name})
          .sort('meta.updateAt')
          .exec(cb);
      }
    };

这段代码定义了一组方法：批量查询和查找某个id，可以在直接在 Model 级别调用,比如

    const Student = require("../models/student");

    exports.tryStasticFetch = function (req, res) {
      Student.fetch(function (err, students) {
        if (err) return;
        res.json({
          data: students,
          msg: 'stastic fetch success'
        })
      })
    }
    
    exports.tryStasticFindByName = function (req, res) {
      let name = req.query.name || ''
      Student.findByName(name, function (err, students) {
        if (err) return;
        res.json({
          data: students,
          msg: 'stastic findbyname success'
        })
      })
    }

### 4.2 method

`stastic`方法能够在 Model 级别访问，而`method`方法是在实例上进行访问的



### 4.3 middleware

mongoose里的中间件,有两个, 一个是pre, 一个是post.

- pre: 在指定方法执行之前绑定。 中间件的状态分为 `parallel`和`series`
- post: 相当于事件监听的绑定

这里需要说明一下, 中间件一般仅仅只能限于在几个方法中使用. (但感觉就已经是全部了)

- doc 方法上: `init,validate,save,remove`
- model方法上: `count,find,findOne,findOneAndRemove,findOneAndUpdate,update
pre`


#### 4.3.1 pre/after

我们来看一下,pre中间件是如何绑定的。比如，在上述结构中添加如下代码

    studentSchema.pre('save', function (next) {
      if (this.isNew) {
        this.meta.updateAt = this.meta.createAt = Date.now();
      } else {
        this.meta.updateAt = Date.now();
      }
      next()
    });
    
mongoose 会自动在实例被保存操作前创建`updateAt/createAt`

在你调用 model.save方法时, 他会自动执行pre. 如果你想并行执行中间件, 可以设置为:

    schema.pre('save', true, function(next, done) {
      // 并行执行下一个中间件
      next();
    });

#### 4.3.2 post

post会在指定事件后触发

    schema.post('save', function(doc) {
        //在save完成后 触发.
        console.log('%s has been saved', doc._id);
    });

当save方法调用时, 便会触发`post`绑定的`save`事件. 如果你绑定了多个`post`，会按照顺序依次完成`next`

    studentSchema.post('save', function(doc, next) {
      setTimeout(function() {
        console.log('post1');
        next();
      }, 5000);
    });
    
    studentSchema.post('save', function(doc, next) {
      console.log('post2');
      next();
    });
    
    studentSchema.post('save', function(doc, next) {
      setTimeout(function() {
        console.log('post3');
        next();
      }, 10000);
    });
    
    studentSchema.post('save', function(doc, next) {
      setTimeout(function() {
        console.log('post4');
        next();
      }, 3000);
    });
    
实际上,post触发的时间为:

    5s后输出post1 -> 立刻输出post2 -> 10s后输出post3 -> 3s后输出post4

另外,在`post`和`find`中, 是不能直接修改`doc`上的属性的. 像下面一样的,没有效果
    
    articleSchema.post('find',function(docs){
        docs[1].date = 1
    })    



## 五、Population

mongodb 本来就是一门非关系型数据库。但有些场景,我们又需要联合其他的 table 进行数据查找。 这时候, 一般的做法就是实现两次查询，但是效率比较差。

mongoose 提供的 `population` 正是用来连接多表数据查询的。一般而言, 我们只要提供某一个`collection的_id` , 就可以实现完美的联合查询。

`population` 用到的关键字是: `ref`, 用来指明外联的数据库的名字. 一般,我们需要在`schema`中就定义好.

    var mongoose = require('mongoose')
      , Schema = mongoose.Schema
      
    var personSchema = Schema({
      _id     : Number,
      name    : String,
      age     : Number,
      stories : [{ type: Schema.Types.ObjectId, ref: 'Story' }]
    });
    
    var storySchema = Schema({
      _creator : { type: Schema.Types.ObjectId, ref: 'Person' },
      title    : String
    });
    
这里就指明了, 外联数据表的应用关系 

    personSchema <stories> By _id => Story 
    storySchema <_creator> By _id => Person 
    
实际上, 就是通过`_id`的相互索引即可。这里需要说明的是, `_id`应该是某个具体`model`的`id`

我们来看一下, 接下来应该如何利用`population`实现外联查询.

    const sam = new Person({
        name: 'sam',
        _id: 1,
        age: 18,
        stories: []
    });
    
    sam.save((err, sam)=>{
        if(err) return err;
        let story = new Story({
            _creator:sam._id,
            title:"喜剧之王"
        })
    })
    
    Story
        .findOne({ title: "喜剧之王" })
        .populate('_creator')
        .exec((err, story) => {
            if(err) console.log(err);
            console.log(story._creator.name);
        })
        

> 使用`populate`来指定,外联查询的字段, 而且该值必须是`_id`才行
    