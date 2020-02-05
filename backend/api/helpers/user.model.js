const Mongoose = require("mongoose");

const definition = {
    _id: {
        type: String,
        default: null
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    role:{
        type: String,
        enum: ['SuperAdmin', 'Admin'],
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    salt: {
        type: String
    },
    token: {
        type: String
    },
    profileImage:{
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    createdBy: {
        type: String,
        default: 'System'
    },
    deleted:{
        type: String,
        default: false
    }
};


module.exports = new Mongoose.Schema(definition);