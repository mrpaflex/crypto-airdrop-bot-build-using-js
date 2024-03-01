const STATES = {
    userState: new Map(),
    messageState: new Map(),
    previousMessageState: new Map(),
    swapState: new Map(),
    transferState: new Map(),
    secureMessageState: new Map() // used for sensitive messages that needs to be deleted
  };
  
  module.exports = { STATES };


// const STATES = {
//   async initUserState() {
//     // Async initialization of userState
//     return new Map();
//   },
//   async initMessageState() {
//     // Async initialization of messageState
//     return new Map();
//   },
//   async initPreviousMessageState() {
//     // Async initialization of previousMessageState
//     return new Map();
//   },
//   async initSwapState() {
//     // Async initialization of swapState
//     return new Map();
//   },
//   async initTransferState() {
//     // Async initialization of transferState
//     return new Map();
//   },
//   async initSecureMessageState() {
//     // Async initialization of secureMessageState
//     return new Map();
//   }
// };

// // Initialize all the states asynchronously
// (async () => {
//   STATES.userState = await STATES.initUserState();
//   STATES.messageState = await STATES.initMessageState();
//   STATES.previousMessageState = await STATES.initPreviousMessageState();
//   STATES.swapState = await STATES.initSwapState();
//   STATES.transferState = await STATES.initTransferState();
//   STATES.secureMessageState = await STATES.initSecureMessageState();
// })();

// module.exports = { STATES };
