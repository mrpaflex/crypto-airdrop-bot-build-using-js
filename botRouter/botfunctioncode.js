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
const BotDb = require('../model/dbbot.model');


const saveUser = async (ctx) => {
    try {
        const {userId,chatId, userName, startPayload, messageId} =  TelegrafHelper.getUserChatInfo(ctx);
        const user = await User.findOne({userId});

        if (!user) {
         // console.log('i am startPayload', startPayload)//this is a payload or user data that are come along when a user click on the /start command.. for example: if someone refer you, the payload is the information of the person who referred you  
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
      return;
    } catch (error) {
        console.log('error while saving user', error)
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
        return;
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
      return;
      }

      const referralByUser = user.referredBy;
      //console.log('you refer me', referralByUser)

      if (referralByUser) {
        const referalUser = await User.findOne({ userId: referralByUser});
        //console.log('referal user id', referalUser)

        if (referalUser) {
          const referbyId = referalUser._id;
         // console.log('rId', referbyId);
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
      return;
      }
      await saveUser(ctx);
      return;
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
  const{userId, chatId, messageId, message} =  TelegrafHelper.getUserChatInfo(ctx);
  const messageState =  STATES.messageState.get(userId);//always use the user id here not ctx

  let sentMessage = '';

  if ( messageState === 'set_wallet_address') {

    await setWalletAddressMethod(ctx);
    return;

  }else if (message?.toLowerCase() === 'admin login') {
    await AdminLoginMethod(ctx);
    return;

  }else if(messageState=== 'request_withdrawal'){
    await MakeWithdrawal(ctx);
    return;
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


  //await here is really important
  const sentMessage = await TelegrafHelper.sendReponse(
    ctx,
    await Message.referralMessage(userId, countReferrals, balance),
    BUTTONS.balanceButtons
    
  );

  await BaseHelper.deletePrevMsg(bot, chatId, messageId )
  await  BaseHelper.setPrevMsg(userId, sentMessage.message_id)
//not need for return shai
return;

}

//admin login function
const AdminLoginMethod = async (ctx)=>{
  const {userId, chatId, message, messageId} = TelegrafHelper.getUserChatInfo(ctx)
  const botAdmins = EnvironVariables.BOT.ADMINS;
  const isAdmins = botAdmins.includes(userId);

  if (isAdmins) {
     await TelegrafHelper.sendReponse(
      ctx,
      `you have successfully login as an admin. click below to start using the admin bot`,
      BUTTONS.createAdminBot
    )
  }
  return;
}

///bot schema
const CreateBotInDbMethod = async (ctx)=>{
  const {userId, chatId, message, messageId} = TelegrafHelper.getUserChatInfo(ctx);

  const {id, first_name, username}= await ctx.botInfo;
  const dbAdminBot = await BotDb.findOne({botId: id}).lean();
  if (!dbAdminBot) {
    await BotDb.create({
      botId: id,
      botName: first_name,
      botUserName: username
    })
  }

    await TelegrafHelper.sendReponse(
     ctx,
     `choose any button to set action`,
     BUTTONS.adminButtons
   )
  
   return;
}

//take me back to home paage
const TakeMeToHomePage = async (ctx)=>{
  const {userId, chatId, messageId} = TelegrafHelper.getUserChatInfo(ctx);
  const sentMessage = await TelegrafHelper.sendReponse(
    ctx,
    Message.afterJoinGroupMessage,
    BUTTONS.homebuttons
  )

  await BaseHelper.deletePrevMsg(bot, chatId, messageId )
  await  BaseHelper.setPrevMsg(userId, sentMessage.message_id)
  return;
};

//check user balance function
const CheckUserBalance = async (ctx)=>{
  const {userId, chatId, messageId} = TelegrafHelper.getUserChatInfo(ctx);
  const user = await User.findOne({userId}).lean();
  const mybalance = user.balance;
  const sentMessage = await TelegrafHelper.sendReponse(
    ctx,
    `your current balance is ${mybalance} BCG`,
    BUTTONS.balanceButtons
  );
  await BaseHelper.deletePrevMsg(bot, chatId, messageId )
  await  BaseHelper.setPrevMsg(userId, sentMessage.message_id);
  return;
};

// const createBotByAdmin = async(ctx)=>{
//   const bot = await Bot.findOne(ctx.).lean();

// }

const RequestForWithdrawalMethod = async (ctx)=>{
  const {id}= await ctx.botInfo;
  const {userId, messageId, chatId, message } = TelegrafHelper.getUserChatInfo(ctx);

  //check if withdrawal is enable
  const botdb = await BotDb.findOne({botId: id}).lean()
  if (botdb.isWithdrawalEnable === false) {
   const sentMessage = await TelegrafHelper.sendReponse(
      ctx,
      `withdrawal is not enable, try again later`,
      BUTTONS.balanceButtons
    )

    await BaseHelper.deletePrevMsg(bot, chatId, messageId )
    await  BaseHelper.setPrevMsg(userId, sentMessage.message_id);
    return;
  }

  const user = await User.findOne({userId}).lean();
  const balance = user.balance;
  const userWallet = user.userWallet;
 // console.log(userWallet)

  if (balance <= 0 ) {
    await TelegrafHelper.sendReponse(
      ctx,
      `Insufficient fund, share your referral link to earn https://t.me/${EnvironVariables.BOT.BOT_USERNAME}?start=${userId}`,
      BUTTONS.balanceButtons,
    )
   return;
  }

  if (!userWallet || userWallet === 'undefined') {
    await TelegrafHelper.sendReponse(
      ctx,
      `you haven't set your withdrawal wallet yet`,
      Markup.inlineKeyboard([
        Markup.button.callback('📝 Set Wallet', 'set_wallet_address'),
        Markup.button.callback('❌ Cancel', 'go_home')
      ])
    )
    return;
  }

  if (balance> 0) {
    STATES.messageState.set(userId, 'request_withdrawal');

    await TelegrafHelper.sendReponse(
      ctx,
      `set the amount you want to withdraw`,
      Markup.inlineKeyboard([
        Markup.button.callback('❌ Cancel', 'go_home')
      ])
    )
  return;
  }
  
 
}

//make withdrawal method
const MakeWithdrawal = async (ctx)=>{
  const {userId, chatId, message, messageId} = TelegrafHelper.getUserChatInfo(ctx);
  
  const user = await User.findOne({userId}).lean();
  const id = user._id;
  const withdrawAmount = +message;
  const balance = user.balance;
  
  if (withdrawAmount > balance) {
   await TelegrafHelper.sendReponse(
      ctx,
      `insufficient balance, kindly check your current balance and try again`,
      BUTTONS.balanceButtons
    )
    return;
  }

  const newbalance =  balance - withdrawAmount;
    
  await TelegrafHelper.sendReponse(
    ctx,
    `congratulation! You have successfully withdraw ${withdrawAmount} to your wallet ${user.userWallet}. your new balance is ${newbalance}`,
    Markup.inlineKeyboard([
      Markup.button.callback('💰 Withdraw Again', 'request_withdrawal'),
      Markup.button.callback('🏠 Home', 'go_home')
    ])
  )

  await User.findByIdAndUpdate(id, {balance: newbalance}, {new: true, runValidators: true});
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

const EnableWithWithDrawalMethod = async (ctx)=>{
//  const {userId, message, messageId, chatId} = TelegrafHelper.getUserChatInfo(ctx);
  const {id}= await ctx.botInfo;

  const bot = await BotDb.findOne({botId: id});
  if (!bot) {
    ctx.reply('can not process for now')
  }

  
  if (bot.isWithdrawalEnable === true) {
    await TelegrafHelper.sendReponse(
      ctx,
      `withdrawal is already enable`,
     BUTTONS.adminButtons
    )
  }
 if (bot.isWithdrawalEnable === false) {
  const dbBotId = bot._id;

  await BotDb.findByIdAndUpdate(dbBotId, {isWithdrawalEnable: true
  },
  {new: true, runValidators: true}
  )

  await TelegrafHelper.sendReponse(
    ctx,
    `withdrawal is now enable`,
   BUTTONS.adminButtons
  )
 }

};


const DisableWithWithDrawalMethod = async (ctx)=>{
    const {userId, message, messageId, chatId} = TelegrafHelper.getUserChatInfo(ctx);
    const {id}= await ctx.botInfo;
  
    const bot = await BotDb.findOne({botId: id});
    if (!bot) {
      ctx.reply('can not process for now');
      return;
    }
  
    
    if (bot.isWithdrawalEnable === false) {
   await TelegrafHelper.sendReponse(
        ctx,
        `withdrawal is already Disable`,
       BUTTONS.adminButtons
      );
      return;
    }
   if (bot.isWithdrawalEnable === true) {
    const dbBotId = bot._id;
  
    await BotDb.findByIdAndUpdate(dbBotId, {isWithdrawalEnable: false
    },
    {new: true, runValidators: true}
    )
  
  await TelegrafHelper.sendReponse(
      ctx,
      `withdrawal is now Disable`,
     BUTTONS.adminButtons
    );
    return;
   }
  


  };

 const setWalletAddressMethod = async (ctx)=>{

  const {userId, chatId, messageId, message} =  TelegrafHelper.getUserChatInfo(ctx);
  const user = await User.findOne({userId}).lean();
  const id = user._id;

  //validate the wallet here
  const iswalletvalid = await isValidWalletAddress(message);

  if (!iswalletvalid) {
   ctx.reply(`Invalid wallet address`);
   return;
  }


  await User.findByIdAndUpdate(id, {userWallet: message}, {new: true, runValidators: true});

  const sentMessage = await TelegrafHelper.sendReponse(
    ctx,
    `wallet ${message} successfully set`,
    Markup.inlineKeyboard([
      Markup.button.callback('📝 Update Wallet', 'set_wallet_address'),
      Markup.button.callback('🏠 Home', 'go_home')
    ])
  )

  await BaseHelper.deletePrevMsg(bot, chatId, messageId )
  await  BaseHelper.setPrevMsg(userId, sentMessage.message_id);
  return;

 }

 const isValidWalletAddress = async (wallet)=>{
  try {
    const regex = /^(0x)?[0-9a-fA-F]{40}$/;
    return regex.test(wallet);
  } catch (error) {
    console.log(error)
  }
 }


 module.exports = {
    saveUser,
    verifyUserMehod, CheckIfUserIsVerified, handleMessageMethod, referralsProgramFunction, AdminLoginMethod, CreateBotInDbMethod, TakeMeToHomePage, CheckUserBalance, RequestForWithdrawalMethod, MakeWithdrawal, getWallet, EnableWithWithDrawalMethod, DisableWithWithDrawalMethod, setWalletAddressMethod,  }