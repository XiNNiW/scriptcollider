var assert = require('assert');
var proxyquire = require('proxyquire');
var sinon = require('sinon');
var assert = require('assert');
var SuperColliderServer = require('../src/super-collider-server.js');
let SuperColliderSynth;

describe("super collider synth tests",()=>{
  let stubServerInstance = {
    synth:{play:()=>{}}
  };
  let stubServer = sinon.stub(SuperColliderServer,"create",()=>{
    return stubServerInstance;
  });
  beforeEach(()=>{
    SuperColliderSynth = proxyquire("../src/super-collider-synth",{
      "../src/super-collider-server.js":stubServer
    });
  });

  it("is built with a path to its synth-def, endpoint name, and the server",()=>{
   assert(false);
  });

  it("calls the server with with its name when play is called",()=>{
    assert(false);

  });

  it("optional named arguments are routed through to the osc call", ()=>{
    assert(false);
  });

});
