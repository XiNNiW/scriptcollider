let assert = require("assert");
let sinon = require("sinon");
let proxyquire = require('proxyquire');
let oscMessage = require("osc-msg");
let sandbox;
let oscUtility;



describe("osc utility test",()=>{
  beforeEach(()=>{
    sandbox = sinon.sandbox.create();
    encodeStub = sandbox.stub(oscMessage,'encode',()=>{
      return "the buffer";
    });
    decodeStub = sandbox.stub(oscMessage,'decode',()=>{
      return "the message";
    });
    oscUtility = proxyquire(
      '../../src/open-sound-control/osc-utility.js',
      {
        'osc-msg':{
          encode:encodeStub,
          decode:decodeStub
        }
      }
    );
  });

  afterEach(()=>{
    sandbox.restore();
  });

  it("should call osc msg when encode is called",()=>{
    assert(!oscMessage.encode.called,"shouldnt be called yet");
    let messageToEncode = "a message";
    let theBuffer = oscUtility.encode(messageToEncode);
    assert(oscMessage.encode.called,"should pass it on the osc-msg");
    assert.equal(oscMessage.encode.getCall(0).args[0],messageToEncode,"should pass it on the osc-msg");
    assert.equal("the buffer",theBuffer,"should return the result");
  });
  it("should call osc msg when decode is called",()=>{
    assert(!oscMessage.decode.called,"shouldnt be called yet");
    let bufferToDecode = "a message";
    let theMessage = oscUtility.decode(bufferToDecode);
    assert(oscMessage.decode.called,"should pass it on the osc-msg");
    assert.equal(oscMessage.decode.getCall(0).args[0],bufferToDecode,"should pass it on the osc-msg");
    assert.equal("the message",theMessage,"should return the result");
  });
});
