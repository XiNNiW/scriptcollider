var assert = require('assert');
var proxyquire = require('proxyquire');
var sinon = require('sinon');
let dgram = require('dgram');
let oscUtility = require('../../src/open-sound-control/osc-utility.js');
let SuperColliderAsyncCommandMessanger;
let sandbox;
let oscUtilityStub;

describe("super collider command messanger tests: ", ()=>{
  beforeEach(()=>{
    sandbox = sinon.sandbox.create();

    oscUtilityStub = {
      encode: sandbox.stub(oscUtility,'encode'),
      decode: sandbox.stub(oscUtility,'decode')
    };
    SuperColliderAsyncCommandMessanger = proxyquire('../../src/super-collider/super-collider-async-command-messanger.js',{
      './open-sound-control/oscUtility.js': oscUtilityStub
    });
  });
  afterEach(()=>{
    sandbox.restore();
  });
  it("constructed with server", (done)=>{
    let ip = '0.0.0.0';
    let port = 1234;
    let udpServer = dgram.createSocket("udp4");
    sandbox.stub(udpServer, "send", ()=>{});
    let command = new SuperColliderAsyncCommandMessanger(udpServer,port,ip);
    assert.equal(command.server, udpServer);
    done();
  });
  it("takes a message... sends it to server on execute... returns a promise", (done)=>{
    let ip = '0.0.0.0';
    let port = 1234;
    let expectedSyncId = 1;

    oscUtilityStub.encode.returns( "buffer for user command send");

    oscUtilityStub.decode.returns({
      address: "/synced",
      args: [{type: "string", value: expectedSyncId}],
      oscType: "message"
    });

    let udpServer = dgram.createSocket("udp4");
    sandbox.stub(udpServer, "on", (thingToRespondTo, callback)=>{});
    sandbox.stub(udpServer, "send", ()=>{});

    let command = new SuperColliderAsyncCommandMessanger(udpServer,port,ip);
    assert(!udpServer.send.called);
    assert(!udpServer.on.called);

    let message = {
      address: "/d_load",
      args: [{type:"string",value:"synthdefs/snare909"}]
    };
    let thePromiseOfASound = command.execute(message);

    thePromiseOfASound.then(()=>{
      console.log("you are now in the then");
      assert(oscUtility.encode.called);
      assert(udpServer.on.called);
      assert(udpServer.send.called);
      assert.deepEqual(udpServer.on.getCall(0).args[0],"message");
      assert.deepEqual(oscUtility.encode.getCall(0).args[0],message);
      done();
    }).catch((err)=>{
      console.log("the promise rejected " + err)
      assert.equal(err,undefined,"promise should resolve");
      done(err);
    });

    let onMessageCallback = udpServer.on.getCall(0).args[1];

    assert(!oscUtility.decode.called);
    onMessageCallback("the buffer from the server");
    assert(oscUtility.decode.called);

    assert.deepEqual(udpServer.send.getCall(0).args[0], "buffer for user command send");
    assert.deepEqual(udpServer.send.getCall(0).args[1], 0);
    assert.deepEqual(udpServer.send.getCall(0).args[2], "buffer for user command send".length);
    assert.deepEqual(udpServer.send.getCall(0).args[3], port);
    assert.deepEqual(udpServer.send.getCall(0).args[4], ip);

    let errorCallback = udpServer.send.getCall(0).args[2];

    assert.equal(oscUtility.encode.callCount, 2);
    assert.deepEqual(oscUtility.encode.getCall(1).args[0],{
      address:'/sync',
      args:[{type:'integer',value: expectedSyncId}]
    });
    assert.deepEqual(udpServer.send.getCall(1).args[0], "buffer for user command send");
    assert(oscUtility.decode.called);
    assert.equal(oscUtility.decode.getCall(0).args[0], "the buffer from the server");

  });

  it("takes a message... sends it to server on execute... rejects if error occurs", (done)=>{
    let ip = '0.0.0.0';
    let port = 1234;
    let expectedSyncId = 1;
    oscUtilityStub.encode.returns("buffer for user command send");

    oscUtilityStub.decode.returns(
      {
        address: "/synced",
        args: [{type: "string",value: expectedSyncId}],
        oscType: "message"
      }
    );


    let udpServer = dgram.createSocket("udp4");
    sandbox.stub(udpServer, "on", (thingToRespondTo, callback)=>{});
    sandbox.stub(udpServer, "send", ()=>{});

    let command = new SuperColliderAsyncCommandMessanger(udpServer,port,ip);

    let message = {
      address: "/d_load",
      args: [{type:"string",value:"synthdefs/snare909"}]
    };

    let thePromiseOfASound = command.execute(message);
    thePromiseOfASound.then(()=>{
      assert(false,"promise should not resolve");
      done();
    }).catch((err)=>{
      assert(true);
      done();
    });

    let errorCallback = udpServer.send.getCall(0).args[5];

    errorCallback("an error");

  });

  it("counts up from one to generate unique ids for each request",()=>{
    let expectedSyncId = 1;

    let ip = '0.0.0.0';
    let port = 1234;
    oscUtilityStub.encode.returns(
      "buffer for user command send"
    );

    let udpServer = dgram.createSocket("udp4");
    sandbox.stub(udpServer, "on", (thingToRespondTo, callback)=>{});
    sandbox.stub(udpServer, "send", ()=>{});

    let command = new SuperColliderAsyncCommandMessanger(udpServer,port,ip);

    let message = {
      address: "/d_load",
      args: [{type:"string",value:"synthdefs/agoodsynth"}]
    };

    expectedCallCount = 2;
    command.execute(message);
    assert.equal(expectedCallCount,udpServer.send.callCount);
    assert.deepEqual(oscUtility.encode.getCall(expectedCallCount-1).args[0],{
      address:'/sync',
      args:[{type:'integer',value: expectedSyncId}]
    });
    expectedCallCount += 2;
    expectedSyncId++;

    command.execute(message);
    assert.equal(expectedCallCount,udpServer.send.callCount);
    assert.deepEqual(oscUtility.encode.getCall(expectedCallCount-1).args[0],{
      address:'/sync',
      args:[{type:'integer',value: expectedSyncId}]
    });
    expectedCallCount += 2;
    expectedSyncId++;


    command.execute(message);
    assert.equal(expectedCallCount,oscUtility.encode.callCount);
    assert.deepEqual(oscUtility.encode.getCall(expectedCallCount-1).args[0],{
      address:'/sync',
      args:[{type:'integer',value: expectedSyncId}]
    });
    expectedCallCount += 2;
    expectedSyncId++;

    command.execute(message);
    assert.equal(expectedCallCount,oscUtility.encode.callCount);
    assert.deepEqual(oscUtility.encode.getCall(expectedCallCount-1).args[0],{
      address:'/sync',
      args:[{type:'integer',value: expectedSyncId}]
    });
    expectedCallCount += 2;
    expectedSyncId++;

    command.execute(message);
    assert.equal(expectedCallCount,oscUtility.encode.callCount);
    assert.deepEqual(oscUtility.encode.getCall(expectedCallCount-1).args[0],{
      address:'/sync',
      args:[{type:'integer',value: expectedSyncId}]
    });
    expectedCallCount += 2;
    expectedSyncId++;






  });
});
