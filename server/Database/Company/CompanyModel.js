var Q = require('q')
var mongoose = require('mongoose')
var bcrypt = require('bcrypt-nodejs')
var salt = 10


var CompanySchema = new mongoose.Schema({
  username: {
    type : String,
    required : true
  },
  active: {
    type: Boolean
  },
  email : {
    type : String,
  },

  password : {
    type : String,
    required : true
  },
  salt : String,
  code: Number
})

CompanySchema.methods.comparePasswords = function (candidatePassword) {
  var savedPassword = this.password
  return Q.Promise(function (resolve, reject) {
    bcrypt.compare(candidatePassword, savedPassword, function (err, isMatch) {
      if (err) {
        reject(err)
      } else {
        resolve(isMatch)
      }
    })
  })
}

CompanySchema.pre('save', function (next) {
  var company = this

  // only hash the password if it has been modified (or is new)
  if (!company.isModified('password')) {
    return next()
  }

  // generate a salt
  bcrypt.genSalt(salt, function (err, salt) {
    if (err) {
      return next(err)
    }

    // hash the password along with our new salt
    bcrypt.hash(company.password, salt, null, function (err, hash) {
      if (err) {
        return next(err)
      }

      // override the cleartext password with the hashed one
      company.password = hash
      company.salt = salt
      next()
    })
  })
})

module.exports = mongoose.model('companies', CompanySchema)
