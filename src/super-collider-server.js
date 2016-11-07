let exec = require('child_process').exec
let udpService = require('dgram');
let oscUtility = require('./open-sound-control/osc-utility.js');

let _server;
class _SuperColliderServer{
  constructor(server,childProcess,ip,port){
    this.childProcess = childProcess;
    this.connectionProperties = {
      port: port,
      ip : ip
    };
    _server = server;


    // _server.on("message", (buffer) => {
    //   let message1 = oscUtility.decode(buffer, { strict: true, strip: true });
    //   console.log("recieveing message from supercollider");
    //
    //   if (!message1.error) {
    //     console.log(JSON.stringify(message1, null, 2));
    //   }else{
    //     console.log(message1.error);
    //   }
    // });

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
  loadSynthDef(synthDefName){
    console.log('loading synth: '+ this.synthName);
    let message = {
      address: "/d_load",
      arguments: [synthDefName]
    };
    _encodeAndSendToServer(message,this.connectionProperties.port,this.connectionProperties.ip,(err)=>{console.log(err)});
  };
  newSynthSound(synthDefName,synthParameters,connectionParameters){
    let graphPlacement = _setIfDefined(connectionParameters.graphPlacement,SuperColliderServer.Synth.ADD_TO_HEAD_OF_TARGET_GROUP);
    let synthSoundId = _setIfDefined(connectionParameters.synthSoundId,-1);
    let soundGraphInstructionArray = [
      synthSoundId,
      graphPlacement,
      connectionParameters.target
    ];

    let synthArgumentArray = [];
    Object.keys(synthParameters).map((key)=>{
      synthArgumentArray.push("/"+key,synthParameters[key]);
    });

    let messageArguments = ["/"+synthDefName];
    messageArguments = messageArguments.concat(soundGraphInstructionArray);
    messageArguments = messageArguments.concat(synthArgumentArray);

    let message = {
      address: "/s_new",
      arguments: messageArguments
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
  _server.send(buffer,0,buffer.length,port,ip,callback);
};

let _instance = undefined;

var SuperColliderServer = {
  instance: function(){
    if(_instance===undefined){
      let ip = '127.0.0.1';
      let port = 57121;
      let childProcess = exec("/Applications/SuperCollider/SuperCollider.app/Contents/MacOS/scsynth -u " + port);
      let udpServer = udpService.createSocket("udp4");
      udpServer.bind({address:ip,port:57123,exclusive:true});
      _instance = new _SuperColliderServer(udpServer,childProcess,ip,port);
    }
    return _instance;
  },
  Synth:{
    ADD_TO_HEAD_OF_TARGET_GROUP:0,
    ADD_TO_TAIL_OF_TARGET_GROUP:1,
    ADD_BEFORE_TARGET_NODE:2,
    ADD_AFTER_TARGET_NODE:3
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
