"use strict;"

const definition = {
    _id: {
        type: String
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    scheduledAt: {
        type: Date,
        required: true
    },
    banner:{
        type: String,
        required: true
    },
    guestFile: {
        type: String,
        required: true
    },
    totalGuests: {
        type: Number,
        default: 0
    },
    guests:[{
        firstName: {type: String},
        lastName: {type: String},
        email: {type: String},
        hasCheckedIn: {type: Boolean, default: false},
        signature: {type: String}
    }],
    createdAt: {
        type: Date,
        default: Date.now()
    },
    createdBy:{
        type: String
    },
    deleted: {
        type: Boolean,
        default: false
    }
};

module.exports = definition;