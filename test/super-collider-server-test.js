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
      send:sandbox.stub()
    };

    createSocketStub = sandbox.stub(dgram,"createSocket", ()=>{
      return udpServerStub;
    });

    let oscUtilityStub = {
      encode: sandbox.stub(oscUtility,'encode', ()=>{}),
      decode: sandbox.stub(oscUtility,'decode', ()=>{})
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

  it('should launch sc server on init and return server object', function() {
    var server_one = SuperColliderServer.create();
    assert(server_one,"should be defined");
    assert(execStub.calledOnce,"should be created only once");
    assert(
      execStub.calledWith("/Applications/SuperCollider/SuperCollider.app/Contents/MacOS/scsynth -u 1729"),
      "should be called with the right args"
    );
  });
  it("should open a udp connection upon init",()=>{
    var server = SuperColliderServer.create();
    assert(server,"should be defined");
    assert(dgram.createSocket.calledOnce);
    assert.equal(dgram.createSocket.getCall(0).args[0],"udp4");
  });
  it('should store connection properties', function() {
    var server_one = SuperColliderServer.create();
    assert(server_one,"should be defined");
    assert(server_one.childProcess,"the connection object","should store the port");
    assert(server_one.connectionProperties.port,1729,"should store the port");
    assert(server_one.connectionProperties.ip,'127.0.0.1',"should store the port");
  });
  it('should be a singleton', function() {
    var server_one = SuperColliderServer.create();
    assert(server_one,"should be defined");
    var server_two = SuperColliderServer.create();
    assert.deepEqual(server_one,server_two);
    assert(execStub.calledOnce,"should be created only once");
    assert(
      execStub.calledWith("/Applications/SuperCollider/SuperCollider.app/Contents/MacOS/scsynth -u 1729"),
      "should be called with the right args"
    );
  });
  it('can quit the server',()=>{
    var server = SuperColliderServer.create();
    assert(server,"should be defined");
    assert(!oscUtility.encode.called);
    assert(!udpServerStub.send.called);
    server.quit();
    assert(oscUtility.encode.called);
    assert.equal(oscUtility.encode.getCall(0).args[0],"/quit");
    assert(udpServerStub.send.called);
  });
});
