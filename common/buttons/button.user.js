const { Markup } = require('telegraf');


const BUTTONS={
    homebuttons: Markup.inlineKeyboard([
       [ 
        Markup.button.callback(`💰 Check Balance`, 'get_balance'),
        Markup.button.callback(`📝🔍 About`, 'about_us')
       ],
       [
        Markup.button.callback(`👭 Referrals`, 'get_referrals'),
        Markup.button.callback(`⚙️ Wallet`, 'wallet')

        ]
 
    ]),
    
    balanceButtons: Markup.inlineKeyboard([
        Markup.button.callback('💰Request Withdraw', `request_withdrawal`),
        Markup.button.callback('🏠 Home', 'go_home')
      ]),

      adminButtons: Markup.inlineKeyboard([
        [Markup.button.callback('📣 Broadcast Message', 'broadcast_message')],
        [
          Markup.button.callback('📈 Stats', 'get_stats'),
          Markup.button.callback('🔒 Admin Logout', 'admin_logout')
        ],
        [
          Markup.button.callback('🔓 Enable Withdrawal', 'enable_withdrawal'),
          Markup.button.callback('❌ Disable Withdrawal', 'disable_withdrawal')
        ]
      ]),


      createAdminBot: Markup.inlineKeyboard([
        [Markup.button.callback('📣 Use Bot Admin', 'create_bot_in_db')],
      ]),
}


module.exports= { BUTTONS }