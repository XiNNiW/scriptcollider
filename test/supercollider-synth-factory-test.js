var assert = require('assert');
var sinon = require('sinon');
var proxyquire = require('proxyquire');
var SuperColliderServer = require('../src/super-collider-server.js');
var promise = require('promise');
var SuperColliderSynthFactory;
var SuperColliderSynth = require('../src/super-collider-synth.js');
var NodePlacement = require('../src/super-collider-node-placement');

describe("supercollider synth factory tests",()=>{
  var sandbox;
  var stubServerInstance;
  beforeEach(()=>{
    sandbox = sinon.sandbox.create();
    stubServerInstance = {
      play:sandbox.stub(),
      loadSynthDef:sandbox.stub()
    };
    let stubServer = sandbox.stub(SuperColliderServer,"instance",()=>{
      return stubServerInstance;
    });
    SuperColliderSynthFactory = proxyquire('../src/super-collider-synth-factory.js',{
      '../src/super-collider-server.js':stubServer
    });
  });
  afterEach(()=>{
    sandbox.restore();

  });

  it("on construction -- calls server create on init, tries to load definition sets a property",()=>{
    let promiseFromServer = Promise.resolve();
    stubServerInstance.loadSynthDef.returns(promiseFromServer);
    assert(!SuperColliderServer.instance.called);
    let theFactory = SuperColliderSynthFactory.instance();

    assert(SuperColliderServer.instance.called);

    assert(!stubServerInstance.loadSynthDef.called);
    assert(!promiseFromServer.then.called);
    let expectedName = "909snare";
    let expectedPathToSynthDef = "the/path/to/yoursynths/"
    let expectedNode = {id:33};
    let expectedGraphPlacement = NodePlacement.ADD_TO_HEAD_OF_TARGET_GROUP;
    let expectedCustomArgs = {arg:"grr"};
    let aPromiseForASynth = theFactory.create(expectedName,expectedPathToSynthDef,expectedNode,expectedGraphPlacement,expectedCustomArgs);
    assert(stubServerInstance.loadSynthDef.called);
    assert.deepEqual(stubServerInstance.loadSynthDef.getCall(0).args,[expectedPathToSynthDef+expectedName]);

    return aPromiseForASynth.then((theSynth)=>{
      assert.equal(theSynth.name,expectedName);
      assert.deepEqual(theSynth.outputNode,expectedNode);
      assert.equal(theSynth.graphPlacement, expectedGraphPlacement);
      assert.deepEqual(theSynth.customArguments,expectedCustomArgs);
    });

  });

  it("is a singlton",()=>{
    assert(!SuperColliderServer.instance.called);
    let theFactory = SuperColliderSynthFactory.instance();
    assert(SuperColliderServer.instance.calledOnce);
    let theSecondFactory = SuperColliderSynthFactory.instance();
    assert(SuperColliderServer.instance.calledOnce);
    assert.deepEqual(theFactory,theSecondFactory);

  });

});
