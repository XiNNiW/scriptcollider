var assert = require('assert');
var proxyquire = require('proxyquire');
var sinon = require('sinon');
var SuperColliderServer;
let child_process = require('child_process');
let dgram = require('dgram');
let oscUtility = require('../src/open-sound-control/osc-utility.js');
var sandbox;
var execStub;
var udpServerStub;
var createSocketStub;

describe('SuperColliderServer Tests: ', function() {
  beforeEach(()=>{
    sandbox = sinon.sandbox.create();
    execStub = sandbox.stub(child_process, "exec",()=>{
      return "the connection object";
    });

    udpServerStub = {
      bind:sandbox.stub(),
      send:sandbox.stub(),
      close:sandbox.stub()
    };

    createSocketStub = sandbox.stub(dgram,"createSocket", ()=>{
      return udpServerStub;
    });

    let oscUtilityStub = {
      encode: sandbox.stub(oscUtility,'encode', ()=>{
        return "the buffer";
      }),
      decode: sandbox.stub(oscUtility,'decode', ()=>{

      })
    }

    SuperColliderServer = proxyquire(
      '../src/super-collider-server.js',
      {
        'child_process':{exec: execStub},
        'dgram':{createSocket: createSocketStub},
        'open-sound-control/oscUtility': oscUtilityStub
      }
    );

  });

  afterEach(()=>{
    sandbox.restore();
  });

  it('should launch sc server on init and return a promise for a server object', function() {
    let expectedPort = 57121;
    let expectedIp ='127.0.0.1';
    var server_one = SuperColliderServer.instance();
    assert(server_one,"should be defined");
    assert(execStub.calledOnce,"should be created only once");
    assert(
      execStub.calledWith("/Applications/SuperCollider/SuperCollider.app/Contents/MacOS/scsynth -u " + expectedPort),
      "should be called with the right args"
    );
  });
  it("should open a udp connection upon init",()=>{
    let expectedSupercolliderPort = 57121;
    let expectedListeningPort = 57123;
    let expectedIp ='127.0.0.1';
    var server = SuperColliderServer.instance();
    assert(server,"should be defined");
    assert(dgram.createSocket.calledOnce);
    assert.equal(dgram.createSocket.getCall(0).args[0],"udp4");
    assert(udpServerStub.bind.calledOnce);
    assert.deepEqual(udpServerStub.bind.getCall(0).args[0],{address:expectedIp,port:expectedListeningPort,exclusive:true});
  });
  it('should store connection properties', function() {
    let expectedPort = 57121;
    let expectedIp ='127.0.0.1';
    var server_one = SuperColliderServer.instance();
    assert(server_one,"should be defined");
    assert(server_one.childProcess,"the connection object","should store the port");
    assert(server_one.connectionProperties.port,expectedPort,"should store the port");
    assert(server_one.connectionProperties.ip,expectedIp,"should store the port");
  });
  it('should be a singleton', function() {
    let expectedPort = 57121;
    let expectedIp ='127.0.0.1';
    var server_one = SuperColliderServer.instance();
    assert(server_one,"should be defined");
    var server_two = SuperColliderServer.instance();
    assert.deepEqual(server_one,server_two);
    assert(execStub.calledOnce,"should be created only once");
    assert(
      execStub.calledWith("/Applications/SuperCollider/SuperCollider.app/Contents/MacOS/scsynth -u " + expectedPort),
      "should be called with the right args"
    );
  });
  it('can quit the server',()=>{
    let expectedPort = 57121;
    let expectedIp ='127.0.0.1';
    var server = SuperColliderServer.instance();
    assert(server,"should be defined");
    assert(!oscUtility.encode.called);
    assert(!udpServerStub.send.called);
    server.quit();
    assert(oscUtility.encode.called);
    let expectedMessage = {
      address:"/quit",
      arguments:[]
    }
    assert.deepEqual(oscUtility.encode.getCall(0).args[0],expectedMessage);
    assert(udpServerStub.send.called);
    let theCallback = checkUdpMessageSent_returnCallback(udpServerStub, expectedPort, expectedIp);
    assert(!udpServerStub.close.called,"socket should be open until the callback");
    theCallback();
    assert(udpServerStub.close.called,"after callback close");
  });
  it("defines instruction flags for adding sounds to the sc sound graph",()=>{
    assert(SuperColliderServer.Synth.ADD_TO_HEAD_OF_TARGET_GROUP!==undefined,"instruction defined");
    assert(SuperColliderServer.Synth.ADD_TO_TAIL_OF_TARGET_GROUP!==undefined,"instruction defined");
    assert(SuperColliderServer.Synth.ADD_BEFORE_TARGET_NODE!==undefined,"instruction defined");
    assert(SuperColliderServer.Synth.ADD_AFTER_TARGET_NODE!==undefined,"instruction defined");
    assert.equal(SuperColliderServer.Synth.ADD_TO_HEAD_OF_TARGET_GROUP,0,"instruction correct");
    assert.equal(SuperColliderServer.Synth.ADD_TO_TAIL_OF_TARGET_GROUP,1,"instruction correct");
    assert.equal(SuperColliderServer.Synth.ADD_BEFORE_TARGET_NODE,2,"instruction correct");
    assert.equal(SuperColliderServer.Synth.ADD_AFTER_TARGET_NODE,3,"instruction correct");
  });
  it("can call s_new on the server and pass array of named arguments -- if no id provided let sc assign it by passing -1 -- if no position instruction tell sc to assign it to head of synth graph",()=>{
    let expectedPort = 57121;
    let expectedIp ='127.0.0.1';
    var server = SuperColliderServer.instance();
    assert(server,"should be defined");
    assert(!oscUtility.encode.called);
    assert(!udpServerStub.send.called);
    let targetNodeId =5;
    let expectedSynthName = "name";
    server.newSynthSound(
      expectedSynthName,
      {freq:440,amp:0.5,aCustomArg:"a value"},
      {target: targetNodeId}
    );
    assert(oscUtility.encode.called);
    assert(udpServerStub.send.called);
    assert.equal(oscUtility.encode.getCall(0).args[0].address,"/s_new");
    let expectedArguments = ["/"+expectedSynthName,-1,0,targetNodeId,"/freq",440,"/amp",0.5,"/aCustomArg","a value"];
    assert.deepEqual(oscUtility.encode.getCall(0).args[0].arguments,expectedArguments);
    checkUdpMessageSent_returnCallback(udpServerStub, expectedPort, expectedIp);
  });
  it("can call s_new on the server and pass array of named arguments -- instructions for audio graph placement -- ADD_TO_HEAD_OF_TARGET",()=>{
    let expectedPort = 57121;
    let expectedIp ='127.0.0.1';
    var server = SuperColliderServer.instance();
    assert(server,"should be defined");
    assert(!oscUtility.encode.called);
    assert(!udpServerStub.send.called);
    let targetNodeId =5;
    let expectedSynthName = "name";
    let expectedSynthSoundId = 500;
    server.newSynthSound(
      expectedSynthName,
      {freq:440,amp:0.5,aCustomArg:"a value"},
      {
        target: targetNodeId,
        synthSoundId:expectedSynthSoundId,
        graphPlacement:SuperColliderServer.Synth.ADD_TO_HEAD_OF_TARGET_GROUP
      });
    assert(oscUtility.encode.called);
    assert(udpServerStub.send.called);
    assert.equal(oscUtility.encode.getCall(0).args[0].address,"/s_new");
    let expectedArguments = ["/"+expectedSynthName,expectedSynthSoundId,0,targetNodeId,"/freq",440,"/amp",0.5,"/aCustomArg","a value"];
    assert.deepEqual(oscUtility.encode.getCall(0).args[0].arguments,expectedArguments);
    checkUdpMessageSent_returnCallback(udpServerStub, expectedPort, expectedIp);
  });
  it("can call s_new on the server and pass array of named arguments -- instructions for audio graph placement -- ADD_TO_TAIL_OF_TARGET_GROUP",()=>{
    let expectedPort = 57121;
    let expectedIp ='127.0.0.1';
    var server = SuperColliderServer.instance();
    assert(server,"should be defined");
    assert(!oscUtility.encode.called);
    assert(!udpServerStub.send.called);
    let targetNodeId =5;
    let expectedSynthName = "name";
    let expectedSynthSoundId = 234;
    server.newSynthSound(
      expectedSynthName,
      {freq:440,amp:0.5,aCustomArg:"a value"},
      {
        target: targetNodeId,
        synthSoundId:expectedSynthSoundId,
        graphPlacement:SuperColliderServer.Synth.ADD_TO_TAIL_OF_TARGET_GROUP
      });
    assert(oscUtility.encode.called);
    assert(udpServerStub.send.called);
    assert.equal(oscUtility.encode.getCall(0).args[0].address,"/s_new");
    let expectedArguments = ["/"+expectedSynthName,expectedSynthSoundId,1,targetNodeId,"/freq",440,"/amp",0.5,"/aCustomArg","a value"];
    assert.deepEqual(oscUtility.encode.getCall(0).args[0].arguments,expectedArguments);
    checkUdpMessageSent_returnCallback(udpServerStub, expectedPort, expectedIp);
  });
  it("can call s_new on the server and pass array of named arguments -- instructions for audio graph placement -- ADD_BEFORE_TARGET_NODE",()=>{
    let expectedPort = 57121;
    let expectedIp ='127.0.0.1';
    var server = SuperColliderServer.instance();
    assert(server,"should be defined");
    assert(!oscUtility.encode.called);
    assert(!udpServerStub.send.called);
    let targetNodeId =5;
    let expectedSynthName = "name";
    let expectedSynthSoundId = 234;
    server.newSynthSound(
      expectedSynthName,
      {freq:440,amp:0.5,aCustomArg:"a value"},
      {
        target: targetNodeId,
        synthSoundId:expectedSynthSoundId,
        graphPlacement:SuperColliderServer.Synth.ADD_BEFORE_TARGET_NODE
      });
    assert(oscUtility.encode.called);
    assert(udpServerStub.send.called);
    assert.equal(oscUtility.encode.getCall(0).args[0].address,"/s_new");
    let expectedArguments = ["/"+expectedSynthName,expectedSynthSoundId,2,targetNodeId,"/freq",440,"/amp",0.5,"/aCustomArg","a value"];
    assert.deepEqual(oscUtility.encode.getCall(0).args[0].arguments,expectedArguments);
    checkUdpMessageSent_returnCallback(udpServerStub, expectedPort, expectedIp);
  });
  it("can call s_new on the server and pass array of named arguments -- instructions for audio graph placement -- ADD_BEFORE_TARGET_NODE",()=>{
    let expectedPort = 57121;
    let expectedIp ='127.0.0.1';
    var server = SuperColliderServer.instance();
    assert(server,"should be defined");
    assert(!oscUtility.encode.called);
    assert(!udpServerStub.send.called);
    let targetNodeId = 64;
    let expectedSynthName = "name";
    let expectedSynthSoundId = 4;
    server.newSynthSound(
      expectedSynthName,
      {freq:440,amp:0.5,aCustomArg:"a value"},
      {
        target: targetNodeId,
        synthSoundId:expectedSynthSoundId,
        graphPlacement:SuperColliderServer.Synth.ADD_AFTER_TARGET_NODE
      });
    assert(oscUtility.encode.called);
    assert(udpServerStub.send.called);
    assert.equal(oscUtility.encode.getCall(0).args[0].address,"/s_new");
    let expectedArguments = ["/"+expectedSynthName,expectedSynthSoundId,3,targetNodeId,"/freq",440,"/amp",0.5,"/aCustomArg","a value"];
    assert.deepEqual(oscUtility.encode.getCall(0).args[0].arguments,expectedArguments);
    checkUdpMessageSent_returnCallback(udpServerStub, expectedPort, expectedIp);
  });
  it("can call d_load to tell sc server to load a synth def", ()=>{
    let expectedPort = 57121;
    let expectedIp ='127.0.0.1';
    var server = SuperColliderServer.instance();
    assert(server,"should be defined");
    assert(!oscUtility.encode.called);
    assert(!udpServerStub.send.called);
    let expectedName = "synthDefName"
    server.loadSynthDef(expectedName);
    assert(oscUtility.encode.called);
    assert(udpServerStub.send.called);
    assert.equal(oscUtility.encode.getCall(0).args[0].address,"/d_load");
    let expectedArguments = [expectedName];
    assert.deepEqual(oscUtility.encode.getCall(0).args[0].arguments,expectedArguments);
    let theCallback = checkUdpMessageSent_returnCallback(udpServerStub, expectedPort, expectedIp);
  });
  let checkUdpMessageSent_returnCallback = function(udpServerStub, expectedPort, expectedIp){
    assert.equal(udpServerStub.send.getCall(0).args[0],"the buffer","sends the results of encode");
    assert.equal(udpServerStub.send.getCall(0).args[1],0, "no buffer offset");
    assert.equal(udpServerStub.send.getCall(0).args[2],"the buffer".length, "full length of the buffer");
    assert.equal(udpServerStub.send.getCall(0).args[3],expectedPort,"on the right port");
    assert.equal(udpServerStub.send.getCall(0).args[4],expectedIp,"to the right IP");
    let theCallback = udpServerStub.send.getCall(0).args[5];
    return theCallback;
  };

});
