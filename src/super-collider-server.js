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

  };
  quit(){
    let message = {
      address:"/quit",
      arguments:[]
    }
    let buffer = oscUtility.encode(message);
    _server.send(buffer,0,buffer.length,this.connectionProperties.port, this.connectionProperties.ip,(err)=>{
      console.log(err);
      _server.close();
    });

  };
  newSynthSound(synthDefName,targetNodeId,synthParameters){
    let address = "/s_new";
    let synthArgumentArray = [];
    let graphPlacementInstructionArray = [-1,0,1];
    Object.keys(synthParameters).map((key)=>{
      synthArgumentArray.push("/"+key,synthParameters[key]);
    });
    let message = {
      address: address,
      arguments: graphPlacementInstructionArray.concat(synthArgumentArray)
    };
    let buffer = oscUtility.encode(message);
    _server.send(buffer,0,buffer.length,this.connectionProperties.port,this.connectionProperties.ip,(err)=>{
      console.log(err);
    });
  };
};

let _instance = undefined;

var SuperColliderServer = {
  create: function(){
    if(_instance===undefined){
      let ip = '127.0.0.1';
      let port = 57121;
      let childProcess = exec("/Applications/SuperCollider/SuperCollider.app/Contents/MacOS/scsynth -u " + port);
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
