var SuperColliderServer = require('./super-collider-server.js');
var SuperColliderSynth = require('./super-collider-synth.js');
var Promise = require('promise');

class _SuperColliderSynthFactory{
  constructor(superColliderServer){
    this.superColliderServer = superColliderServer
  };
  create(synthName,pathToSynthDefinition,outputNode,graphPlacement,customArguments){
    this.superColliderServer.loadSynthDef(pathToSynthDefinition+synthName,pathToSynthDefinition);
    return new SuperColliderSynth(synthName,outputNode,graphPlacement,customArguments);
    // console.log("calling for the synth");
    // return new Promise((resolve,reject)=>{
    //   this.superColliderServer.loadSynthDef(synthName,pathToSynthDefinition).then(()=>{
    //     resolve(new SuperColliderSynth(synthName,outputNode,graphPlacement,customArguments));
    //   }).catch((err)=>{
    //     reject(error);
    //   });
    // });
  }
};
var _instance;
let SuperColliderSynthFactory = {
  instance: ()=>{
    if(_instance === undefined){
      console.log("making the factory");
      _instance = new _SuperColliderSynthFactory(SuperColliderServer.instance());
    }
    return _instance;
  }
};
module.exports = SuperColliderSynthFactory;
