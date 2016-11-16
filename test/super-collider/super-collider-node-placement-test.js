var assert = require('assert');
var NodePlacement = require('../../src/super-collider/super-collider-node-placement.js');

describe('SuperColliderServer Tests: ', () => {
  it('defines valid instructions for placing nodes in super colliders sound graph', ()=>{
    assert.equal(NodePlacement.ADD_TO_HEAD_OF_TARGET_GROUP,0);
    assert.equal(NodePlacement.ADD_TO_TAIL_OF_TARGET_GROUP,1);
    assert.equal(NodePlacement.ADD_BEFORE_TARGET_NODE,2);
    assert.equal(NodePlacement.ADD_AFTER_TARGET_NODE,3);
  });
});
