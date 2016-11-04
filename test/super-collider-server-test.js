var assert = require('assert');
var proxyquire = require('proxyquire');
var sinon = require('sinon');
// var SuperColliderServer = require('../src/super-collider-server.js');
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
    var server_one = SuperColliderServer.create();
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
    var server = SuperColliderServer.create();
    assert(server,"should be defined");
    assert(dgram.createSocket.calledOnce);
    assert.equal(dgram.createSocket.getCall(0).args[0],"udp4");
    assert(udpServerStub.bind.calledOnce);
    assert.deepEqual(udpServerStub.bind.getCall(0).args[0],{address:expectedIp,port:expectedListeningPort,exclusive:true});
  });
  it('should store connection properties', function() {
    let expectedPort = 57121;
    let expectedIp ='127.0.0.1';
    var server_one = SuperColliderServer.create();
    assert(server_one,"should be defined");
    assert(server_one.childProcess,"the connection object","should store the port");
    assert(server_one.connectionProperties.port,expectedPort,"should store the port");
    assert(server_one.connectionProperties.ip,expectedIp,"should store the port");
  });
  it('should be a singleton', function() {
    let expectedPort = 57121;
    let expectedIp ='127.0.0.1';
    var server_one = SuperColliderServer.create();
    assert(server_one,"should be defined");
    var server_two = SuperColliderServer.create();
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
    var server = SuperColliderServer.create();
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
    assert.equal(udpServerStub.send.getCall(0).args[0],"the buffer","sends the results of encode");
    assert.equal(udpServerStub.send.getCall(0).args[1],0, "no buffer offset");
    assert.equal(udpServerStub.send.getCall(0).args[2],"the buffer".length, "full length of the buffer");
    assert.equal(udpServerStub.send.getCall(0).args[3],expectedPort,"on the right port");
    assert.equal(udpServerStub.send.getCall(0).args[4],expectedIp,"to the right IP");
    let theCallback = udpServerStub.send.getCall(0).args[5];
    assert(!udpServerStub.close.called,"socket should be open until the callback");
    theCallback();
    assert(udpServerStub.close.called,"after callback close");
  });
  it("can call s_new on the server and pass array of named arguments -- if no id provided let sc assign it by passing -1 -- if no position instruction tell sc to assign it to head of synth graph",()=>{
    let expectedPort = 57121;
    let expectedIp ='127.0.0.1';
    var server = SuperColliderServer.create();
    assert(server,"should be defined");
    assert(!oscUtility.encode.called);
    assert(!udpServerStub.send.called);
    let targetNodeId = 1;
    server.newSynthSound("name",targetNodeId,{freq:440,amp:0.5,aCustomArg:"a value"});
    assert(oscUtility.encode.called);
    assert(udpServerStub.send.called);
    assert.equal(oscUtility.encode.getCall(0).args[0].address,"/s_new");
    let expectedArguments = [-1,0,1,"/freq",440,"/amp",0.5,"/aCustomArg","a value"];
    assert.deepEqual(oscUtility.encode.getCall(0).args[0].arguments,expectedArguments);
    assert.equal(udpServerStub.send.getCall(0).args[0],"the buffer","sends the results of encode");
    assert.equal(udpServerStub.send.getCall(0).args[1],0, "no buffer offset");
    assert.equal(udpServerStub.send.getCall(0).args[2],"the buffer".length, "full length of the buffer");
    assert.equal(udpServerStub.send.getCall(0).args[3],expectedPort,"on the right port");
    assert.equal(udpServerStub.send.getCall(0).args[4],expectedIp,"to the right IP");
    let theCallback = udpServerStub.send.getCall(0).args[5];
  });

});
