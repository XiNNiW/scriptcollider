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
    let buffer = oscUtility.encode('/quit');
    _server.send(buffer);
  };
}

let instance = undefined;

var SuperColliderServer = {
  create: function(){
    if(instance===undefined){
      let ip = '127.0.0.1';
      let port = 1729;
      let childProcess = exec("/Applications/SuperCollider/SuperCollider.app/Contents/MacOS/scsynth -u " + port);
      let udpServer = udpService.createSocket("udp4");
      instance = new _SuperColliderServer(udpServer,childProcess,ip,port);
    }
    return instance;
  }
};

module.exports = SuperColliderServer;
