// var assert = require('assert');
// var sinon = require('sinon');
// var proxyquire = require('proxyquire');
// var SuperColliderServer = require('../src/super-collider-server.js');
// var AbstractSuperColliderSynthFactory;
//
// describe("abstract synth factory tests",()=>{
//   var sandbox;
//   var stubServerInstance;
//   beforeEach(()=>{
//     sandbox = sinon.sandbox.create();
//     stubServerInstance = {
//       play:sandbox.stub(),
//       loadSynthDef:sandbox.stub()
//     };
//     let stubServer = sandbox.stub(SuperColliderServer,"instance",()=>{
//       return stubServerInstance;
//     });
//     AbstractSuperColliderSynthFactory = proxyquire('../src/abstract-supercollider-synth-factory.js',{
//       '../src/super-collider-server.js':stubServer
//     });
//   });
//   afterEach(()=>{
//     sandbox.restore();
//
//   });
//
//   it("is a singlton -- calls server create on init",()=>{
//     theFactory = AbstractSuperColliderSynthFactory.instance();
//     assert(false);
//   });
//
//   it("tells sc server to load the synth def specified and returns a promise for the factory when load is called",()=>{
//     assert(false);
//   });
//
// });
