const  Mongoose  = require("mongoose");

const BotSchema = new Mongoose.Schema({
    botName:{
        type: String,
        required: true
    },

    botUserName:{
        type: String,
        required: true
    },
    botId:{
        type: String,
        required: true
    },
    isWithdrawalEnable:{
        type: Boolean,
        default: false
    }
});

// ,
// { timestamps: true }

const BotDb = Mongoose.model("DbBot", BotSchema);
module.exports = BotDb