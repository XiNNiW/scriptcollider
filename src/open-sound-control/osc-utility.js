let openSoundControlMessage = require('osc-msg');
module.exports = {
  encode:(message)=>{
    let buffer = openSoundControlMessage.encode(message);
    return buffer;
  },
  decode:(buffer)=>{
    let message = openSoundControlMessage.decode(buffer);
    return message;
  }
};
