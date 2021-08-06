const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email : {
        type: String,
        required : true
    },
    passwordHash : {
        type: String,
        required:true
    },
    street: {
        type: String,
        default : ""
    },
    city : {
        type: String,
        default : ""
    },
    zip : {
        type: String,
        default: ""
    },
    country : {
        type: String,
        default: ""
    },
    phone : {
        type: String,
        default: ""
    },
    isAdmin : {
        type: Boolean,
        default:false
    },
    dateCreated : {
        type: Date,
        default: Date.now
    }
})

userSchema.virtual("id").get(function () {
    return this._id.toHexString()
})

userSchema.set("toJSON", {
    virtuals:true
})

module.exports = mongoose.model("User", userSchema) 