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
    await verifyUserMehod(ctx)
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

bot.action('get_referrals', async (ctx)=>{
  try {
    await referralsProgramFunction(ctx)
  } catch (error) {
    console.log(error)
  }
})

bot.on('message', async (ctx)=>{
  try {
    await handleMessageMethod(ctx)
  } catch (error) {
    console.log(error)
  }
})


///from here will be in a separate file
const saveUser = async (ctx) => {
    try {
        const {userId,chatId, userName, startPayload, messageId} =  TelegrafHelper.getUserChatInfo(ctx);


      
        const user = await User.findOne({userId});

        if (!user) {
          console.log('i am startPayload', startPayload)//this is a payload or user data that are come along when a user click on the /start command.. for example: if someone refer you, the payload is the information of the person who referred you  
            let referredBy;

            if (startPayload && startPayload === userId) {
              await replyWithHTML(`you can not refer yourself`)       
           }

            if (startPayload && startPayload !== userId) {
               referredBy = startPayload        
            }


      await User.create({
                userId: userId, 
                userName: userName,
                referredBy: referredBy
            })
                 
        }

 //check if uer is verified that is if the user has join join
    const isverified =  await CheckIfUserIsVerified(ctx);

    if (!isverified) {
      return;
    }

    ///if you have verify response with this message below

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

const verifyUserMehod = async (ctx) => {
  const {userId, chatId, messageId} = TelegrafHelper.getUserChatInfo(ctx);
  try {
      const groupJoined = EnvironVariables.TELEGRAM_GROUPS;
      let verificationStatus = false;

      for (const telegroupId of groupJoined) {
        const isValidMember = await ctx.telegram.getChatMember(telegroupId, userId).then((chatMember) => {
            const status = chatMember.status;
            return ['member', 'admin', 'administrator', 'creator', 'restricted'].includes(status);
        }).catch((error) => {
            console.log('Error getting chat member:', error); // Log the error
            return false;
        });
    
        if (!isValidMember) {
            verificationStatus = false;
            break;
        } else {
            verificationStatus = true;
        }
    }
    

      if (!verificationStatus) {
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
          await BaseHelper.deletePrevMsg(bot, chatId, messageId )
          await  BaseHelper.setPrevMsg(userId, sentMessage.message_id)
          return;
      }

      const user = await User.findOne({userId});
      const id = user._id;

      if (user) {
        await User.findByIdAndUpdate(
          id,
          {isUserVerify: true},
          {new: true, runValidators: true}
      );
      }

      const referralByUser = user.referredBy;
      //console.log('you refer me', referralByUser)

      if (referralByUser) {
        const referalUser = await User.findOne({ userId: referralByUser});
        //console.log('referal user id', referalUser)

        if (referalUser) {
          const referbyId = referalUser._id;
          console.log('rId', referbyId);
          const referPoint = EnvironVariables.REFERRALPOINT;
          const currentblance = referalUser.balance
          // console.log(' i am rfpoint', referPoint);
          // console.log('my current balance', currentblance);
          const userbalance = currentblance + referPoint
          // console.log('your balance', userbalance)

          await User.findByIdAndUpdate(
              referbyId,
              {balance: userbalance},
              {new: true, runValidators: true}
          );
      }
      }
      await saveUser(ctx);
  } catch (error) {
      console.log(error);
      // Handle error appropriately, e.g., notify the user
  }
};

//check if uer is verify

const CheckIfUserIsVerified = async (ctx)=>{

  const {userId, chatId, messageId} =  TelegrafHelper.getUserChatInfo(ctx);

  const user = await User.findOne({userId}).lean()

  if (user && user.isUserVerify === false) {
      await ctx.replyWithHTML(Message.welcomeMessage(user.userName),
      { disable_web_page_preview: true });

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

    return true

};

//handle user messages function///check later
const handleMessageMethod = async (ctx)=>{
  const{userId, chatId, messageId} =  TelegrafHelper.getUserChatInfo(ctx);
  const messageState =  STATES.messageState.get(userId);//always use the user id here not ctx

  let sentMessage = '';

  if ( messageState === 'set_wallet_address') {

    await setWalletAddressMethod(ctx);

  }

      await BaseHelper.deletePrevMsg(bot, chatId, messageId )
      await  BaseHelper.setPrevMsg(userId, sentMessage.message_id)
      return;


}
//referal function

const referralsProgramFunction= async (ctx)=>{
  const {userId, chatId, messageId } = TelegrafHelper.getUserChatInfo(ctx);
  const user = await User.findOne({userId}).lean();
  if (!user) {
   await ctx.reply(`can proceed!`)
  }

  const countReferrals = await User.countDocuments({
    referredBy: userId
    ///to count by the array of string check i later
  }).lean();
 /// console.log(countReferrals);
  //get user balance

  const balance = user.balance || 0;
  //console.log(balance)

  const sentMessage = TelegrafHelper.sendReponse(
    ctx,
    await Message.referralMessage(userId, countReferrals, balance),
    BUTTONS.balanceButtons
    
  );

  await BaseHelper.deletePrevMsg(bot, chatId, messageId )
  await  BaseHelper.setPrevMsg(userId, sentMessage.message_id)

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
