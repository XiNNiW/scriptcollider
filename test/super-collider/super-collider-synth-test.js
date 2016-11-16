var assert = require('assert');
var proxyquire = require('proxyquire');
var sinon = require('sinon');
var assert = require('assert');
var NodePlacement = require('../../src/super-collider/super-collider-node-placement.js');
var SuperColliderServer = require('../../src/super-collider/super-collider-server.js');

describe("super collider synth tests",()=>{
  var SuperColliderSynth;
  var stubServerInstance;
  var sandbox;
  beforeEach(()=>{
    sandbox = sinon.sandbox.create()
    stubServerInstance = {
      play:sandbox.stub(),
      newSynthSound:sandbox.stub()
    };
    let stubServer = sandbox.stub(SuperColliderServer,"instance",()=>{
      return stubServerInstance;
    });
    SuperColliderSynth = proxyquire("../../src/super-collider/super-collider-synth",{
      "./super-collider-server.js":stubServer
    });
  });

  afterEach(()=>{
    sandbox.restore();
  });


  it("is built with a path to its synth-def, endpoint name",()=>{
    assert(!SuperColliderServer.instance.called,"no server communication yet");
    let expectedName = "name";
    let expectedNode = {
      id: 77
    };
    let expectedPlacement = NodePlacement.ADD_TO_HEAD_OF_TARGET;
    let expectedCustomArguments = {customArgument:"value"};
    let synth = new SuperColliderSynth(expectedName,expectedNode,expectedPlacement,expectedCustomArguments);
    assert(SuperColliderServer.instance.called,"get the server instance");
    assert.equal(synth.name,expectedName,"has its name");
    assert.deepEqual(synth.outputNode, expectedNode);
    assert.equal(synth.graphPlacement,expectedPlacement);
    assert.deepEqual(synth.customArguments,expectedCustomArguments);

  });

  it("calls the server with with its name when play is called",()=>{
    assert(!SuperColliderServer.instance.called);
    let expectedName = "name";
    let expectedNode = {
      id: 75
    };
    let expectedGraphPlacement = NodePlacement.ADD_TO_HEAD_OF_TARGET_GROUP;
    let synth = new SuperColliderSynth(expectedName,expectedNode,expectedGraphPlacement,{customArgument:"value"});
    assert(SuperColliderServer.instance.called,"gets the sc server instance");
    assert(!stubServerInstance.newSynthSound.called,"has not made a sound yet");
    synth.play(50,127,{
      someArguments:"grrrr",
      moreArg:"pirate style",
    });
    assert(stubServerInstance.newSynthSound.called,"calls through to the sc server to make the sound");
    assert.equal(stubServerInstance.newSynthSound.getCall(0).args[0],expectedName,"");
    assert.deepEqual(stubServerInstance.newSynthSound.getCall(0).args[1],{freq:50,amp:127,someArguments:"grrrr",moreArg:"pirate style"});
    assert.deepEqual(stubServerInstance.newSynthSound.getCall(0).args[2],{target:expectedNode.id,graphPlacement:expectedGraphPlacement});

  });

  it("is built with a path to its synth-def, endpoint name",()=>{
    assert(!SuperColliderServer.instance.called,"no server communication yet");
    let expectedName = "name";
    let expectedNode = {
      id: 77
    };
    let expectedPlacement = NodePlacement.ADD_TO_HEAD_OF_TARGET;
    let expectedCustomArguments = {customArgument:"value"};
    let synth = new SuperColliderSynth(expectedName,expectedNode,expectedPlacement,expectedCustomArguments);
    assert(SuperColliderServer.instance.called,"get the server instance");
    assert.equal(synth.name,expectedName,"has its name");
    assert.deepEqual(synth.outputNode, expectedNode);
    assert.equal(synth.graphPlacement,expectedPlacement);
    assert.deepEqual(synth.customArguments,expectedCustomArguments);

  });

  it("calls the server with with its name when play is called -- no customArguments",()=>{
    assert(!SuperColliderServer.instance.called);
    let expectedName = "name";
    let expectedNode = {
      id: 75
    };
    let expectedGraphPlacement = NodePlacement.ADD_TO_HEAD_OF_TARGET_GROUP;
    let synth = new SuperColliderSynth(expectedName,expectedNode,expectedGraphPlacement,{customArgument:"value"});
    assert(SuperColliderServer.instance.called,"gets the sc server instance");
    assert(!stubServerInstance.newSynthSound.called,"has not made a sound yet");
    synth.play(50,127);
    assert(stubServerInstance.newSynthSound.called,"calls through to the sc server to make the sound");
    assert.equal(stubServerInstance.newSynthSound.getCall(0).args[0],expectedName,"");
    assert.deepEqual(stubServerInstance.newSynthSound.getCall(0).args[1],{freq:50,amp:127});
    assert.deepEqual(stubServerInstance.newSynthSound.getCall(0).args[2],{target:expectedNode.id,graphPlacement:expectedGraphPlacement});

  });

  it("calls the server with with its name when play is called -- no customArguments null",()=>{
    assert(!SuperColliderServer.instance.called);
    let expectedName = "name";
    let expectedNode = {
      id: 75
    };
    let expectedGraphPlacement = NodePlacement.ADD_TO_HEAD_OF_TARGET_GROUP;
    let synth = new SuperColliderSynth(expectedName,expectedNode,expectedGraphPlacement,{customArgument:"value"});
    assert(SuperColliderServer.instance.called,"gets the sc server instance");
    assert(!stubServerInstance.newSynthSound.called,"has not made a sound yet");
    synth.play(50,127,null);
    assert(stubServerInstance.newSynthSound.called,"calls through to the sc server to make the sound");
    assert.equal(stubServerInstance.newSynthSound.getCall(0).args[0],expectedName,"");
    assert.deepEqual(stubServerInstance.newSynthSound.getCall(0).args[1],{freq:50,amp:127});
    assert.deepEqual(stubServerInstance.newSynthSound.getCall(0).args[2],{target:expectedNode.id,graphPlacement:expectedGraphPlacement});

  });


});
