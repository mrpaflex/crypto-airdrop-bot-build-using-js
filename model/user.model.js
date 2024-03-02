//const { type } = require("express/lib/response");
const  Mongoose  = require("mongoose");

const UserSchema = new Mongoose.Schema({
    userName: {
        type: String,
        required: true
    },

    userId: {
        type: String,
        required: true
    },

    isUserVerify: {
        type: Boolean,
        default: false
    },

    dateJoined: {
        type: Date,
        default: Date.now()
    },
    userWallet: {
        type: String, 
    },

    balance: {
        type: Number,
        default: 0
    },

    referrals:{
        type: [String]
    },

    referredBy:{
        type: String
    }
})

const User = Mongoose.model("User", UserSchema);
module.exports = User