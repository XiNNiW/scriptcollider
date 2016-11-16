
let SuperColliderServer = require('./super-collider-server')
let NodePlacement = require('./super-collider-node-placement');

class SuperColliderSynth{
  constructor(synthName,outputNode,graphPlacement,customArguments){
    this.name = synthName;
    this.server = SuperColliderServer.instance();
    this.outputNode = outputNode;
    this.graphPlacement = graphPlacement;
    this.customArguments = customArguments;
  };
  play(note,velocity,customArguments){
    console.log('playing synth: '+this.name);
    let soundParameters = {
      freq:note,
      amp:velocity
    };
    let connectionParameters = {
      target: this.outputNode.id,
      graphPlacement: this.graphPlacement
    };
    if(customArguments!==undefined && customArguments!== null){
      Object.keys(customArguments).map((key)=>{
        soundParameters[key] = customArguments[key];
      });
    };
    this.server.newSynthSound(this.name,soundParameters,connectionParameters);
  };
};


module.exports = SuperColliderSynth;
