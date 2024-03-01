const crypto = require('crypto');
const {STATES} = require('../module/StateMondule/state.message.helper');
const {TelegrafHelper} = require('../telegrafHelper/telegraf.helper');
//const { ErrorHandler } = require('./error');
//const { ENVIRONMENT } = require('./environment');
require('dotenv').config();
const {EnvironVariables} = require('../../environment/environ.variables');

const BaseHelper = {
   algorithm : 'aes-256-cbc',
  // eslint-disable-next-line no-undef
  securityKey : crypto.scryptSync(
    EnvironVariables.BOT.ENCRYPTION_KEY,
    EnvironVariables.BOT.ENCRYPTION_KEY,
    32
  ),
  iv : crypto.scryptSync(
    EnvironVariables.BOT.ENCRYPTION_KEY,
    EnvironVariables.BOT.ENCRYPTION_KEY,
    16
  ),

  encryptPrivateKey(pk) {
    const cipher = crypto.createCipheriv(
      this.algorithm,
      this.securityKey,
      this.iv
    );

    let encrypted = cipher.update(pk, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    console.log('pk encrypted', encrypted);

    return encrypted;
  },

  decryptPrivateKey(encryptedPk) {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.securityKey,
      this.iv
    );

    let decryptedData = decipher.update(encryptedPk, 'hex', 'utf-8');
    decryptedData += decipher.final('utf8');

    return decryptedData;
  },

  parseToMarkdown(text) {
    const charactersToEscape = [
      '_',
      // "*",
      '[',
      ']',
      '(',
      ')',
      '~',
      // "`",
      '>',
      '#',
      '+',
      '-',
      '=',
      '|',
      '{',
      '}',
      '.',
      '!'
    ];
    let newText = text.toString();
    charactersToEscape.forEach((character) => {
      newText = newText.replace(
        new RegExp('\\' + character, 'g'),
        '\\' + character
      );
    });
    return newText;
  },

  trimNumberToString(number, maxDecimals = 9) {
    // Convert to string using fixed-point notation to ensure all necessary decimals are present
    const fixedString =
      typeof number === 'string'
        ? parseInt(number).toFixed(maxDecimals + 1)
        : number.toFixed(maxDecimals + 1);

    // Use a regular expression to trim to the desired number of decimal places without rounding
    const trimmedString = fixedString.replace(
      new RegExp(`(\\d*\\.\\d{${maxDecimals}})\\d*`),
      '$1'
    );

    // Remove any trailing zeros after the decimal point to clean up the format
    return trimmedString.replace(/\.0+$|(\.\d+?)0+$/, '$1');
  },

  convertToBigInt(amount, decimal) {
    return BigInt(Math.floor(amount * Math.pow(10, decimal)));
  },

  // async setPrevMsg(tgId, msgId) {
  //   try {
  //     STATES.previousMessageState.set(tgId, msgId);
  //   } catch (error) {
  //     ErrorHandler.asyncErrors(error);
  //   }
  // }

  setPrevMsg: async(tgId, msgId)=> {
    try {
      return STATES.previousMessageState.set(tgId, msgId);
    } catch (error) {
      ErrorHandler.asyncErrors(error);
    }
  },

  // async getPrevMsg(tgId) {
  //   try {
  //     return STATES.previousMessageState.get(tgId);
  //   } catch (error) {
  //     ErrorHandler.asyncErrors(error);
  //   }
  // }

  getPrevMsg : async (tgId) =>{
    try {
      return STATES.previousMessageState.get(tgId);
    } catch (error) {
      ErrorHandler.asyncErrors(error);
    }
  },

  // async deletePrevMsg(bot, tgId, chatId) {
  //   try {
  //     const msgId = STATES.previousMessageState.get(tgId);

  //     if (msgId) {
  //       await TelegrafHelper.deleteMessage({ bot, chatId, messageId: msgId });
  //     }
  //   } catch (error) {
  //     ErrorHandler.asyncErrors(error);
  //   }
  // }

  deletePrevMsg : async (bot, chatId, messageId)=> {
    try {
      const msgId = STATES.previousMessageState.get(chatId);
      messageId = msgId

      if (messageId) {
        return await TelegrafHelper.deleteMessaged( bot, chatId, messageId );
      }
    } catch (error) {
      console.log(error)
    }
  }
}

module.exports = { BaseHelper };



// const {STATES} = require('../module/StateMondule/state.message.helper');
// const {TelegrafHelper} = require('../telegrafHelper/telegraf.helper');

// const BaseHelper = {
//   ////start using from here
//   setPrevMsg: async(tgId, msgId)=> {
//     try {
//       return STATES.previousMessageState.set(tgId, msgId);
//     } catch (error) {
//       ErrorHandler.asyncErrors(error);
//     }
//   },

//   getPrevMsg : async (tgId) =>{
//     try {
//       return STATES.previousMessageState.get(tgId);
//     } catch (error) {
//       ErrorHandler.asyncErrors(error);
//     }
//   },

//   deletePrevMsg : async (bot, chatId, messageId)=> {
//     try {
//       const msgId = STATES.previousMessageState.get(chatId);
//       messageId = msgId

//       if (messageId) {
//         return await TelegrafHelper.deleteMessaged( bot, chatId, messageId );
//       }
//     } catch (error) {
//       console.log(error)
//     }
//   }
// }

// module.exports = { BaseHelper };