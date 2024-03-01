//note this telegraf-helper is just like you dto in nestjs so it can be either interface or classs

const TelegrafHelper = {
    getUserChatInfo:  (ctx)=>{
         try {
            return  {
                userId: ctx?.from?.id,
                userName: ctx?.from?.username,
                message: ctx?.message?.text,
                chatId: ctx?.chat?.id,
                messageId: ctx?.message?.message_id,
                startPayload: ctx?.startPayload
        }
         } catch (error) {
            console.log('error getting users info', error)
         }
    },
//sendResponse
sendReponse : async(ctx, message, keyboard = null)=>{
        try {
            return await ctx.reply(`${message}`, keyboard)
        } catch (error) {
            console.log(error)
        }
    },

    //  async deleteMessage({ bot, chatId, messageId }) {
    //     try {
    //       chatId &&
    //         messageId &&
    //         (await bot.telegram.deleteMessage(chatId, messageId));
    //     } catch (error) {
    //       console.log('deleteMessage error : ', error);
    //     }
    //   },

 deleteMessaged: async (bot, chatId, messageId)=>{
  
    try {
        return await bot.telegram.deleteMessage(chatId, messageId)
    } catch (error) {
        console.log(error)
    }
 }

}

module.exports = { TelegrafHelper };

