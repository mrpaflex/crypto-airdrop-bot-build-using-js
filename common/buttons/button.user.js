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
        Markup.button.callback('💰 Withdraw', `request_withdrawal`),
        Markup.button.callback('🏠 Home', 'go_home')
      ]),
}


module.exports= { BUTTONS }