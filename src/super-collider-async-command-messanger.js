let oscUtility = require('./open-sound-control/osc-utility.js');

class SuperColliderAsyncCommandMessanger{
  constructor(server,port,ip){
    this.server = server;
    this.port = port;
    this.ip = ip;
  }
  execute(messageToSend){
    let idForRequest = 100;
    let promiseOfServerCommand = new Promise((resolve,reject)=>{
      this.server.on("message",(buffer)=>{
        let messageFromServer = oscUtility.decode(buffer);
        console.log("id: " + idForRequest);
        console.log("recieved synced" + JSON.stringify(messageFromServer));
        if(messageFromServer.address === "/synced" && messageFromServer.args[0].value === idForRequest){
          console.log("made it ");
          resolve();
        }

      });
      _encodeAndSendToServer(this.server,messageToSend,this.port,this.ip,(error)=>{
        if(error!==null){
          console.log("error "+error);
          reject(error);
        }
      });
      var syncMessage = {
        address:'/sync',
        args:[{type:'integer',value: idForRequest}]
      }
      _encodeAndSendToServer(this.server,syncMessage,this.port,this.ip,(error)=>{
        if(error!==null){
          console.log("error "+error);
          reject(error);
        }
      });
    });
    return promiseOfServerCommand;

  }
}

let _encodeAndSendToServer = function(server,message, port, ip,callback){
  let buffer = oscUtility.encode(message);
  server.send(buffer,0,buffer.length,port,ip,callback);
};

module.exports = SuperColliderAsyncCommandMessanger;
