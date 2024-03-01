const { EnvironVariables } = require('../environment/environ.variables');
const { Telegraf } = require('telegraf');
const bot = new Telegraf(EnvironVariables.BOT.BOT_TOKEN);
const { TelegrafHelper } = require('../common/telegrafHelper/telegraf.helper');
const User = require('../model/user.model');
//const {TelegrafHelper} = require('../common/telegrafHelper/telegraf.helper')
const {Message} = require('../common/telegrafHelper/botMessage');
const { BaseHelper } = require('../common/utils/baseHelper');
const {BUTTONS} = require('../common/buttons/button.user');
const { Markup } = require('telegraf');
const { STATES } = require('../common/module/StateMondule/state.message.helper');


bot.start(async (ctx) => {
   try {
    await saveUser(ctx)
   } catch (error) {
    console.log(error)
   }
});

//bot on to verify user
bot.action('verify_user', async (ctx)=>{
  try {
    await verifyUser(ctx)
  } catch (error) {
    console.log(error)
  }
});

//wallets
bot.action('wallet', async (ctx)=>{
  try {
    await getWallet(ctx)
  } catch (error) {
    console.log(error)
  }
});


bot.action('set_wallet_address', async (ctx)=>{
  try {
    const {userId, chatId, message, messageId} = TelegrafHelper.getUserChatInfo(ctx);
    const stateM =  STATES.messageState.set(userId, 'set_wallet_address');

   // const statemsg = STATES.messageState.get(userId)

    const sentMessage = await TelegrafHelper.sendReponse(
      ctx,
      `set your wallet address below`,
      Markup.inlineKeyboard([
        Markup.button.callback('❌ Cancel', 'go_home')
      ])
    )

  
   await BaseHelper.deletePrevMsg(bot, chatId, messageId )
   await  BaseHelper.setPrevMsg(userId, sentMessage.message_id);
  } catch (error) {
    console.log(error)
  }
});

bot.on('message', async (ctx)=>{
  try {
    await handleMessageMethod(ctx)
  } catch (error) {
    console.log(error)
  }
})

const saveUser = async (ctx) => {
    try {
        const {userId,chatId, userName, startPayload, messageId} =  TelegrafHelper.getUserChatInfo(ctx);

        //console.log('i am startPayload', startPayload)//this is a payload or user data that are come along when a user click on the /start command.. for example: if someone refer you, the payload is the information of the person who referred you  
      
        const user = await User.findOne({userId});

        if (!user) {
            let referralId;

            if (startPayload && startPayload !== userId) {
                referralId = startPayload        
            }

      await User.create({
                userId: userId, 
                userName: userName,
                referralId: referralId
            })
            //check if uer is verified thaat is if the user has join join
                 
        }

    

    const isverified =  await CheckIfUserIsVerified(ctx);

    if (!isverified) {
      return;
    }

    ///if your have verify response with this message below

    const sentMessage = await TelegrafHelper.sendReponse(
      ctx,
      Message.afterJoinGroupMessage,
      BUTTONS.homebuttons
      )

      await BaseHelper.deletePrevMsg(bot, chatId, messageId )
      await  BaseHelper.setPrevMsg(userId, sentMessage.message_id)

    } catch (error) {
        console.log('error whie saving user', error)
    }
}

const verifyUser = async (ctx) => {
    const {userId} =  TelegrafHelper.getUserChatInfo(ctx);
    try {
       const user = await User.findOne({userId})
       //console.log to check the user     
      // console.log('now verifying this user', user.userName)
       const id = user._id

       await User.findByIdAndUpdate(
        id, 
        {isUserVerify: true},
        {new: true, runValidators: true}
        )

        //if updated successfully send a response
       await saveUser(ctx);
    } catch (error) {
        console.log(error)
    }
}

//check if uer is verify

const CheckIfUserIsVerified= async (ctx)=>{

  const {userId, chatId, messageId} =  TelegrafHelper.getUserChatInfo(ctx);

  const user = await User.findOne({userId})

  if (user && user.isUserVerify === false) {
      await ctx.replyWithHTML(Message.welcomeMessage(user.userName))

            const sentMessage = await ctx.replyWithHTML(Message.botCondition, {
                disable_web_page_preview: true,
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: '✅ DONE',
                        callback_data: 'verify_user'
                      }
                    ]
                  ]
                }
              });

              //set the previous message
        await BaseHelper.deletePrevMsg(bot, chatId, messageId )
         await  BaseHelper.setPrevMsg(userId, sentMessage.message_id)

            return false
          
  }

 //if (user && user.isUserVerify === true) {
    return true
 //}
  

  //if user reponse with another message below

};

//handle user messages function///check later
const handleMessageMethod = async (ctx)=>{
  const{userId, userName, message, chatId, messageId} =  TelegrafHelper.getUserChatInfo(ctx);

  const messageState =  STATES.messageState.get(userId);//always use the user id here not ctx

  let sentMessage = '';

  if ( messageState === 'set_wallet_address') {

    await setWalletAddressMethod(ctx);

  }

      await BaseHelper.deletePrevMsg(bot, chatId, messageId )
      await  BaseHelper.setPrevMsg(userId, sentMessage.message_id)
      return;


}

//get wallet function
const getWallet = async (ctx)=>{
  const {userId, chatId, messageId, message} =  TelegrafHelper.getUserChatInfo(ctx);
  const user = await User.findOne({userId: userId});
  if (!user) {
    await ctx.reply(`error occur`)
  }

  if (user.userWallet) {
   
    const sentMessage = await TelegrafHelper.sendReponse(
      ctx,
      `your wallet address is ${user.userWallet}`,
      Markup.inlineKeyboard([
        Markup.button.callback('📝 Update Wallet', 'set_wallet_address'),
        Markup.button.callback('🏠 Home', 'go_home')
      ])
    )
    await BaseHelper.deletePrevMsg(bot, chatId, messageId )
    await  BaseHelper.setPrevMsg(userId, sentMessage.message_id)
    return;
  }
  
  const sentMessage = await TelegrafHelper.sendReponse(
    ctx,
    `you haven't set your wallet address yet, set wallet address`,
    Markup.inlineKeyboard([
      Markup.button.callback('🔗 Set Your Wallet', 'set_wallet_address'),
      Markup.button.callback('❌ Cancel', 'go_home')
    ])
  )

  await BaseHelper.deletePrevMsg(bot, chatId, messageId )
  await  BaseHelper.setPrevMsg(userId, sentMessage.message_id);
  return;
}

 const setWalletAddressMethod = async (ctx)=>{

  const {userId, chatId, messageId, message} =  TelegrafHelper.getUserChatInfo(ctx);
  const user = await User.findOne({userId}).lean();
  const id = user._id;

  await User.findByIdAndUpdate(id, {userWallet: message}, {new: true, runValidators: true});

  const sentMessage = TelegrafHelper.sendReponse(
    ctx,
    `wallet successfully set`,
    Markup.inlineKeyboard([
      Markup.button.callback('📝 Update Wallet', 'set_wallet_address'),
      Markup.button.callback('🏠 Home', 'go_home')
    ])
  )

  await BaseHelper.deletePrevMsg(bot, chatId, messageId )
  await  BaseHelper.setPrevMsg(userId, sentMessage.message_id);
 }

module.exports = { bot }
