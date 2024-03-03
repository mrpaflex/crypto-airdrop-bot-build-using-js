const { EnvironVariables } = require('../environment/environ.variables');
const { Telegraf } = require('telegraf');
const bot = new Telegraf(EnvironVariables.BOT.BOT_TOKEN);
const { TelegrafHelper } = require('../common/telegrafHelper/telegraf.helper');
const {Message} = require('../common/telegrafHelper/botMessage');
const { BaseHelper } = require('../common/utils/baseHelper');
const {BUTTONS} = require('../common/buttons/button.user');
const { Markup } = require('telegraf');
const { STATES } = require('../common/module/StateMondule/state.message.helper');

const {saveUser, verifyUserMehod, handleMessageMethod, referralsProgramFunction, CreateBotInDbMethod, TakeMeToHomePage, CheckUserBalance, RequestForWithdrawalMethod, getWallet, EnableWithWithDrawalMethod, DisableWithWithDrawalMethod } = require('./botfunctioncode')


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

//click to take you back to home..home button or when home button is click
bot.action('go_home', async (ctx)=>{
  try {
    await TakeMeToHomePage(ctx)
  } catch (error) {
    console.log(error)
  }
});

bot.action('create_bot_in_db', async (ctx)=>{
  try {
    await CreateBotInDbMethod(ctx)
  } catch (error) {
    console.log(error)
  }
});

bot.action('about_us', async (ctx)=>{
  try {
   const {userId, chatId, messageId} = TelegrafHelper.getUserChatInfo(ctx);
   const sentMessage = await TelegrafHelper.sendReponse(
    ctx,
    Message.about_us,
    Markup.inlineKeyboard([
      Markup.button.callback('📝 OK', 'go_home'),
      Markup.button.callback('🏠 Home', 'go_home')
    ])
   )

   await BaseHelper.deletePrevMsg(bot, chatId, messageId )
   await  BaseHelper.setPrevMsg(userId, sentMessage.message_id);
  } catch (error) {
    console.log(error)
  }
});


bot.action('set_wallet_address', async (ctx)=>{
  try {
    const {userId, chatId, messageId} = TelegrafHelper.getUserChatInfo(ctx);
   STATES.messageState.set(userId, 'set_wallet_address');

    const sentMessage = await TelegrafHelper.sendReponse(
      ctx,
      `set your wallet address below`,
      Markup.inlineKeyboard([
        Markup.button.callback('❌ Cancel', 'go_home')
      ])
    )

  
  //  await BaseHelper.deletePrevMsg(bot, chatId, messageId )
  //  await  BaseHelper.setPrevMsg(userId, sentMessage.message_id);
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
});

bot.action('get_balance', async (ctx)=>{
  try {
    await CheckUserBalance(ctx);
  } catch (error) {
    console.log(error)
  }
});

bot.action('request_withdrawal', async (ctx)=>{
  try {
    await RequestForWithdrawalMethod(ctx)
  } catch (error) {
    
  }
})

bot.action('enable_withdrawal', async (ctx)=>{
  try {
    await EnableWithWithDrawalMethod(ctx)
  } catch (error) {
    
  }
});

bot.action('disable_withdrawal', async (ctx)=>{
  try {
    await DisableWithWithDrawalMethod(ctx)
  } catch (error) {
    
  }
})

bot.on('message', async (ctx)=>{
  try {
    await handleMessageMethod(ctx)
  } catch (error) {
    console.log(error)
  }
})

module.exports = { bot }
