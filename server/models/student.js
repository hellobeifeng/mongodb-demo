const mongoose = require('mongoose')
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



studentSchema.pre('save', function (next) {
  console.log('##inpre save', this.isNew)
  if (this.isNew) {
    this.meta.updateAt = this.meta.createAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }
  next()
});

studentSchema.post('save', function(doc, next) {
  setTimeout(function() {
    console.log('post1');
    next();
  }, 2000);
});

studentSchema.post('save', function(doc, next) {
  console.log('post2');
  next();
});

studentSchema.post('save', function(doc, next) {
  setTimeout(function() {
    console.log('post4');
    next();
  }, 3000);
});

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

module.exports = mongoose.model('student',studentSchema);
