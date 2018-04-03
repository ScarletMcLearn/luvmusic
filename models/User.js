'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto');

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function(property) {
    return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
 * A Validation function for local strategy password
 */
var validateLocalStrategyPassword = function(password) {
    return (this.provider !== 'local' || (password && password.length > 6));
};

/**
 * User Schema
 */
var UserSchema = new Schema({
/*
    firstName: {
        type: String,
        trim: true,
        default: '',
        required: 'First Name required'
      },

    lastName: {
        type: String,
        trim: true,
        default: '',
        required: 'Last Name required'
      },

    displayName: {
        type: String,
        trim: true
    },
*/
    name: {
        type: String,
        trim: true,
        required: 'Your name required'
    },

    email: {
        type: String,
        trim: true,
        unique: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address'],
        required: 'Email required'
    },
    
    username: {
        type: String,
        trim: true,
        unique: true,
        // match: [/a-z0-9-._{3-15}$/, 'Username must be between 3-15 character and can use only ._-'],
        required: 'Username required'
    },
    
    photo: {
        type: String,
        default: 'https://dl.dropboxusercontent.com/s/9v3sn409v94ehzh/pp.jpg?dl=0',
        trim: true
    },
  /*  
    description: {
        type: String,
        default: '',
        trim: true
    },
    
    linkedin: {
        type: String,
        default: '',
        trim: true
    },
    
    twitter: {
        type: String,
        default: '',
        trim: true
    },
  */  
    password: {
        type: String,
        default: '',
        validate: [validateLocalStrategyPassword, 'Password should be longer'],
        required: 'Password required'
    },
    
    city : {
        type: String,
        trim: true,
        required: 'Your city required'
    },
    
    country : {
        type: String,
        trim: true,
        required: 'Your country required'
    },

    salt: {
        type: String
    },
    
    provider: {
        type: String,
        required: 'Provider is required'
    },
    
    providerData: {},
    additionalProvidersData: {},
    roles: {
        type: [{
            type: String,
            enum: ['user', 'admin']
        }],
        default: ['user']
    },
    
    updated: {
        type: Date
    },
    
    created: {
        type: Date,
        default: Date.now
    },
    /* For reset password */
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    }
});

/**
 * Hook a pre save method to hash the password
 */
UserSchema.pre('save', function(next) {
    if (this.password && this.password.length > 6) {
        this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
        this.password = this.hashPassword(this.password);
    }

    next();
});

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function(password) {
    if (this.salt && password) {
        return crypto.pbkdf2Sync(password, this.salt, 10000, 64, 'sha1').toString('base64');
    } else {
        return password;
    }
};

/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function(password) {
    return this.password === this.hashPassword(password);
};

var User = mongoose.model('User', UserSchema, 'users');
module.exports = User;
