const {EnvironVariables} = require('../../environment/environ.variables');
const Message = {
    welcomeMessage: (userUserName)=>{
        return `welcome ${userUserName} to ${EnvironVariables.BOT.BOT_USERNAME} we are here to serve you better any time an day`
    },
    //welcome old or existing user message
    //this might not be necessary

    welcomeExistingUserMessage: (userUserName)=>{
        return `welcome back ${userUserName}`
    },

    //other message here
    afterJoinGroupMessage: `you are now verified, kindly use the button attached to complete other task`,

    about_us: `paflex is a telegram bot for testing now`,

    botCondition: `to use our bot kindly join the following channel`
}

module.exports = {Message}