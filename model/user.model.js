const { type } = require("express/lib/response");
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

    referralId: {
        type: String,
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
        
    }


})

const User = Mongoose.model("User", UserSchema);
module.exports = User