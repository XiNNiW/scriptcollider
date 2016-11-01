let openSoundControlMessage = require('osc-msg');
module.exports = {
  encode:(message)=>{
    let buffer = openSoundControlMessage.encode(message);
    return buffer;
  },
  decode:(buffer)=>{
    console.log("hi");
    let message = openSoundControlMessage.decode(buffer);
    return message;
  }
};
