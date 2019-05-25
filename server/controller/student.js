const Student = require("../models/student");

exports.findAll = function (req, res) {
  Student.find({})
    .sort({ update_at: -1 })
    .then(students => {
      res.json(students);
    })
    .catch(err => {
      console.log(2);
      res.json(err);
    });
}

exports.findById = function (req, res) {
  Student.findById(req.params.id)
    .then(student => {
      res.json(student);
    })
    .catch(err => {
      res.json(err);
    });
}

exports.AddPerson = function (req, res) {
  Student.create(req.body, (err, student) => {
    if (err) {
      res.json(err);
    } else {
      res.json(student);
    }
  });
}

exports.updateById = function (req, res) {
  Student.findOneAndUpdate(
    { _id: req.params.id },
    {
      $set: {
        name: req.body.name,
        age: req.body.age,
        sex: req.body.sex,
        address: req.body.address
      }
    },
    {
      new: true
    }
  )
    .then(student => res.json(student))
    .catch(err => res.json(err));
}

exports.delById = function (req, res) {
  Student.findOneAndRemove({
    _id: req.params.id
  })
    .then(student => res.send(`${student.title}删除成功`))
    .catch(err => res.json(err));
}

exports.addNewKeyForSchema = function (req, res) {
  Student.update({}, { $unset: { newKey1: "" }}, { multi: true })
    .then(student => res.send(`新增newKey成功`))
    .catch(err => res.json(err));
}

exports.querySomeKey = function (req, res) {
  Student.find({}, "name sex")
  .then(result => {
    console.log('##result', result)
    res.send(result)
  })
  .catch(err => res.json(err));

  // 下面和上方的代码效果相同，只不过换成了 callback 方式
  // Student.find({}, "name sex", function(err, result) {
  //   if (err) res.json(err)
  //   console.log('##result', result)
  //   res.send(result)
  // })
}

exports.chainFuncTest = function (req, res) {
  Student
    .find({
      name: /韩/,
      age: { $gt: 20, $lt: 80 },
      sex: { $in: ['woman'] }
    })
    .limit(2)
    .sort({ name: -1 })
    // .select({ name: 1, occupation: 1 })
    .exec(function (err, result){
      if (err) res.json(err)
      console.log('##result', result)
      res.send(result)
    })
}

exports.setOneKeyType = function (req, res) {
  Student.update({}, {$set: { age: 20}}, {multi:true})
  .then(result => {
    console.log('##result', result)
    res.send(result)
  })
  .catch(err => res.json(err));
}

exports.setOneKeyByKey = function (req, res) {
  Student.update({}, {$set: { 'meta.updateAt': Date.now(), 'meta.createAt': Date.now()}}, {multi:true})
  .then(result => {
    console.log('##result', result)
    res.send(result)
  })
  .catch(err => res.json(err));
}

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
