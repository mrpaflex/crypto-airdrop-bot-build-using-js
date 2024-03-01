const express = require('express');
const app= express()
const {connectDB} = require('./configuration/db.config');
const { EnvironVariables } = require('./environment/environ.variables');
const {bot} = require('./botRouter/bot.router');


app.use(express.json());
app.use(express.urlencoded({extended: true}))

//new BotUserService(bot)
 connectDB();



const port = EnvironVariables.PORT || 5000

app.listen(port, ()=>{
    console.log(`server now running on port ${port}`)
})

bot.launch({dropPendingUpdates: true})

// if (bot) {
//     try {
//         bot.launch();
//         console.log(`Bot started`);
//     } catch (error) {
//         console.error(`Error starting bot: ${error}`);
//     }
// } else {
//     console.log('Bot not properly configured.');
// }


//option when launching bot
// bot.launch({
//     dropPendingUpdates: true,
//     polling: {
//         timeout: 10
//     },
//     contextType: 'telegraf',
//     handlerTimeout: 5000,
//     username: 'your_bot_username',
//     contextErrorMessage: 'Oops, something went wrong!',
//     contextError: (err, ctx) => console.error(`Error: ${err}`),
//     telegram: customTelegramInstance,
//     middlewares: [middlewareFunction1, middlewareFunction2]
// });
