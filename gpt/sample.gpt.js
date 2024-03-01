

// const { EnvironVariables } = require('../environment/environ.variables');
// const { Telegraf } = require('telegraf');
// const { TelegrafHelper } = require('../common/telegrafHelper/telegraf.helper');
// const User = require('../model/user.model');
// const { Message } = require('../common/telegrafHelper/botMessage');
// const { BaseHelper } = require('../common/utils/baseHelper');
// const { BUTTONS } = require('../common/buttons/button.user');
// const { Markup } = require('telegraf');
// const { STATES } = require('../common/module/StateMondule/state.message.helper');

// const bot = new Telegraf(EnvironVariables.BOT.BOT_TOKEN);

// bot.start(async (ctx) => {
//    try {
//       await saveUser(ctx);
//    } catch (error) {
//       console.error(error);
//    }
// });

// bot.action('verify_user', async (ctx) => {
//    try {
//       await verifyUser(ctx);
//    } catch (error) {
//       console.error(error);
//    }
// });

// bot.action('wallet', async (ctx) => {
//    try {
//       await getWallet(ctx);
//    } catch (error) {
//       console.error(error);
//    }
// });

// bot.action('set_wallet_address', async (ctx) => {
//    try {
//       const { userId, chatId, messageId } = TelegrafHelper.getUserChatInfo(ctx);
//       STATES.messageState.set(userId, 'set_wallet_address');

//       console.log('State message at set_wallet_address level:', STATES.messageState.get(userId));

//       const sentMessage = await TelegrafHelper.sendResponse(
//          ctx,
//          'Set your wallet address below:',
//          Markup.inlineKeyboard([
//             Markup.button.callback('❌ Cancel', 'go_home')
//          ])
//       );

//       await BaseHelper.deletePrevMsg(bot, chatId, messageId);
//       await BaseHelper.setPrevMsg(userId, sentMessage.message_id);
//    } catch (error) {
//       console.error(error);
//    }
// });

// bot.on('message', async (ctx) => {
//    try {
//       await handleMessageMethod(ctx);
//    } catch (error) {
//       console.error(error);
//    }
// });

// const saveUser = async (ctx) => {
//    try {
//       const { userId, userName, startPayload, chatId, messageId } = TelegrafHelper.getUserChatInfo(ctx);

//       let referralId = null;
//       if (startPayload && startPayload !== userId) {
//          referralId = startPayload;
//       }

//       const user = await User.findOne({ userId });

//       if (!user) {
//          await User.create({
//             userId: userId,
//             userName: userName,
//             referralId: referralId
//          });
//       }

//       const isVerified = await checkIfUserIsVerified(ctx);
//       if (!isVerified) {
//          return;
//       }

//       const sentMessage = await TelegrafHelper.sendResponse(
//          ctx,
//          Message.afterJoinGroupMessage,
//          BUTTONS.homebuttons
//       );

//       await BaseHelper.deletePrevMsg(bot, chatId, messageId);
//       await BaseHelper.setPrevMsg(userId, sentMessage.message_id);
//    } catch (error) {
//       console.error('Error while saving user:', error);
//    }
// };

// const verifyUser = async (ctx) => {
//    const { userId } = TelegrafHelper.getUserChatInfo(ctx);
//    try {
//       await User.findOneAndUpdate(
//          { userId: userId },
//          { isUserVerify: true },
//          { new: true, runValidators: true }
//       );

//       await saveUser(ctx);
//    } catch (error) {
//       console.error(error);
//    }
// };

// const checkIfUserIsVerified = async (ctx) => {
//    const { userId, chatId, messageId } = TelegrafHelper.getUserChatInfo(ctx);
//    const user = await User.findOne({ userId });

//    if (user && !user.isUserVerify) {
//       await ctx.replyWithHTML(Message.welcomeMessage(user.userName), {
//          disable_web_page_preview: true,
//          reply_markup: {
//             inline_keyboard: [
//                [{ text: '✅ DONE', callback_data: 'verify_user' }]
//             ]
//          }
//       });

//       const sentMessage = await ctx.replyWithHTML(Message.botCondition, {
//          disable_web_page_preview: true,
//          reply_markup: {
//             inline_keyboard: [
//                [{ text: '✅ DONE', callback_data: 'verify_user' }]
//             ]
//          }
//       });

//       await BaseHelper.deletePrevMsg(bot, chatId, messageId);
//       await BaseHelper.setPrevMsg(userId, sentMessage.message_id);

//       return false;
//    }

//    return true;
// };

// const handleMessageMethod = async (ctx) => {
//    console.log('Running handleMessage method');
//    const { userId, chatId, messageId } = TelegrafHelper.getUserChatInfo(ctx);
//    const messageState = STATES.messageState.get(userId);

//    console.log('Message state:', messageState);

//    if (messageState === 'set_wallet_address') {
//       console.log('Inside set_wallet_address state');
//       await setWalletAddressMethod(ctx);
//    }

//    await BaseHelper.deletePrevMsg(bot, chatId, messageId);
//    return;
// };

// const getWallet = async (ctx) => {
//    const { userId, chatId, messageId } = TelegrafHelper.getUserChatInfo(ctx);
//    const user = await User.findOne({ userId: userId });

//    if (!user) {
//       await ctx.reply(`An error occurred`);
//       return;
//    }

//    if (user.userWallet) {
//       const sentMessage = await TelegrafHelper.sendResponse(
//          ctx,
//          `Your wallet address is ${user.userWallet}`,
//          Markup.inlineKeyboard([
//             Markup.button.callback('📝 Update Wallet', 'set_wallet_address'),
//             Markup.button.callback('🏠 Home', 'go_home')
//          ])
//       );

//       await BaseHelper.deletePrevMsg(bot, chatId, messageId);
//       await BaseHelper.setPrevMsg(userId, sentMessage.message_id);
//       return;
//    }

//    const sentMessage = await TelegrafHelper.sendResponse(
//       ctx,
//       `You haven't set your wallet address yet. Set your wallet address below:`,
//       Markup.inlineKeyboard([
//          Markup.button.callback('🔗 Set Your Wallet', 'set_wallet_address'),
//          Markup.button.callback('❌ Cancel', 'go_home')
//       ])
//    );

//    await BaseHelper.deletePrevMsg(bot, chatId, messageId);
//    await BaseHelper.setPrevMsg(userId, sentMessage.message_id);
//    return;
// };

// const setWalletAddressMethod = async (ctx) => {
//    const { userId, chatId, messageId, message } = TelegrafHelper.getUserChatInfo(ctx);
//    const user = await User.findOne({ userId }).lean();

//    console.log('User:', user);
//    console.log('Message:', message);
// };

// module.exports = { bot };
