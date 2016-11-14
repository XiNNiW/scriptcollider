let exec = require('child_process').exec
let udpService = require('dgram');
let oscUtility = require('./open-sound-control/osc-utility.js');
let NodePlacement = require('../src/super-collider-node-placement.js');
let SuperColliderAsyncCommandMessanger = require('./super-collider-async-command-messanger.js');

let _server;
class _SuperColliderServer{
  constructor(server,childProcess,ip,port){
    this.childProcess = childProcess;
    this.connectionProperties = {
      port: port,
      ip : ip
    };
    _server = server;
    this.commandMessanger = new SuperColliderAsyncCommandMessanger(_server, port, ip);


    _server.on("message", (buffer) => {
      let message1 = oscUtility.decode(buffer, { strict: true, strip: true });
      console.log("recieveing message from supercollider");

      if (!message1.error) {
        console.log(JSON.stringify(message1, null, 2));
      }else{
        console.log(message1.error);
      }
    });

  };
  quit(){
    console.log("quitting");
    let message = {
      address:"/quit",
      arguments:[]
    }
    _encodeAndSendToServer(message, this.connectionProperties.port,this.connectionProperties.ip,(err)=>{
      console.log(err);
      _server.close();
    });

  };
  loadSynthDef(synthDefPath){
    let message = {
      address: "/d_load",
      args: [{
        type:"string",
        value: synthDefPath
      }]
    };
    return this.commandMessanger.execute(message);
  };
  newSynthSound(synthDefName,synthParameters,connectionParameters){
    let graphPlacement = _setIfDefined(connectionParameters.graphPlacement,NodePlacement.ADD_TO_HEAD_OF_TARGET_GROUP);
    let synthSoundId = _setIfDefined(connectionParameters.synthSoundId,-1);
    let soundGraphInstructionArray = [
      {type:"integer", value: synthSoundId},
      {type: "integer", value: graphPlacement},
      {type: "integer",value: connectionParameters.target}
    ];

    let synthArgumentArray = [];
    Object.keys(synthParameters).map((key)=>{
      let keyType = "string";
      switch(typeof synthParameters[key]){
        case "string":
          keyType = "string";
          break;
        case "number":
          if(Number.isInteger(synthParameters[key])){
            keyType = "integer";
          } else {
            keyType = "float"
          }
          break;
      }

      synthArgumentArray.push({type:"string", value: key});
      synthArgumentArray.push({type:keyType, value: synthParameters[key]});
    });

    let messageArguments = [{type: "string", value: synthDefName}];
    messageArguments = messageArguments.concat(soundGraphInstructionArray);
    messageArguments = messageArguments.concat(synthArgumentArray);

    let message = {
      address: "/s_new",
      args: messageArguments
    };
    _encodeAndSendToServer(message,this.connectionProperties.port,this.connectionProperties.ip,(err)=>{console.log(err)});
  };
};

let _setIfDefined = function(value,defaultValue){
  if(value !== undefined){
    return value;
  } else {
    return defaultValue;
  }
}

let _encodeAndSendToServer = function(message, port, ip,callback){
  let buffer = oscUtility.encode(message);
  console.log(buffer);
  _server.send(buffer,0,buffer.length,port,ip,callback);
};

let _instance = undefined;

var SuperColliderServer = {
  instance: function(){
    if(_instance===undefined){
      let ip = '127.0.0.1';
      let port = 57121;
      let childProcess = exec("/Applications/SuperCollider/SuperCollider.app/Contents/Resources/scsynth -u " + port);
      let udpServer = udpService.createSocket("udp4");
      udpServer.bind({address:ip,port:57123,exclusive:true});
      _instance = new _SuperColliderServer(udpServer,childProcess,ip,port);
    }
    return _instance;
  }
};

module.exports = SuperColliderServer;


// childProcess.stdout.on('data', function(data) {
//     console.log('stdout: ' + data);
// });
// childProcess.stderr.on('data', function(data) {
//     console.log('stdout: ' + data);
// });
// childProcess.on('close', function(code) {
//     console.log('closing code: ' + code);
// });


// let buffer1 = oscUtility.encode({address:"/notify",arguments:[1]});
//
// _server.on("message", (buffer) => {
//   let message1 = oscUtility.decode(buffer, { strict: true, strip: true });
//
//   if (!message1.error) {
//     console.log(JSON.stringify(message1, null, 2));
//   }
// });
// _server.send(buffer1,0,buffer1.length,this.connectionProperties.port, this.connectionProperties.ip,(err)=>{
//   console.log(err);
//   console.log("notify called");
// });

//SPIKE



    // _server.on("message", (buffer) => {
    //   let message1 = oscUtility.decode(buffer, { strict: true, strip: true });
    //
    //   if (!message1.error) {
    //     console.log(JSON.stringify(message1, null, 2));
    //   }
    // });
    //
    // let buffer1 = oscUtility.encode({address:"/notify",arguments:[1]});
    // _server.send(buffer1,0,buffer1.length,this.connectionProperties.port, this.connectionProperties.ip,(err)=>{
    //   console.log(err);
    //   console.log("notify called");
    // });
    //
    // buffer1 = oscUtility.encode({address:"/status"});
    // _server.send(buffer1,0,buffer1.length,this.connectionProperties.port, this.connectionProperties.ip,(err)=>{
    //   console.log(err);
    //   console.log("status called");
    // });


//SPIKE
