var assert = require('assert');
const InterweaveProposals = artifacts.require("InterweaveProposals");

/** A function that lets you assert that some called contract function (wrapped in another async function) experiences a given require error. */
assert.requireEquals = async function(expectedError, funcToTest) {
  let error = "no error! :D :D :D";
  try {
    await funcToTest();
  }
  catch (e) {
    error = e;
  }
  assert.equal(error, "Error: VM Exception while processing transaction: revert " + expectedError);
}

/** A function that lets you assert that some event happened once, and contained the expected arguments. */
assert.eventHappenedOnce = function(tx, eventName, expectedArgs) {
  let events = tx.logs.filter((entry) => {
    return entry.event === eventName
  });
  
  // Make sure there was just one event.
  assert.equal(events.length, 1);
  
  // Make sure it contains the expected values.
  Object.keys(expectedArgs).forEach((argKey) => {
    assert.equal(events[0].args[argKey].toString(), expectedArgs[argKey].toString()); // Compare toStrings in case it's a BigNumber or similar.
  });
}

/** A function that lets you assert that some event happened never. */
assert.eventNeverHappened = function(tx, eventName) {
  return (
    tx.logs.filter((entry) => {
      return entry.event === eventName
    }).length === 0
  );
}

contract('InterweaveProposals', async (accounts) => {
  
  let instance = undefined;
  
  const emptyKey = 0;
  
  const emptyHash = [
    "0x0000000000000000000000000000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000000000000000000000000000"
  ];
  
  let hashPrototype = [
    "0x00000000000000000000000000000000000000000000000000000000000000", // intentionally missing two characters
    "0x0000000000000000000000000000000000000000000000000000000000000000"
  ];
  
  let hash = [];
  
  for (var i = 0; i < 10; i++) {
    hash[i] = [
      hashPrototype[0] + (i + 10),
      hashPrototype[1]
    ];
  }
  
  // A bytes30 message.
  const message = "0x012345670000000000000000000000000000000000000000000076543210";
  
  let nodeKeyFake = undefined;
  let nodeKey = [];
  
  before("Get nodeKeys", async() => {
    instance = await InterweaveProposals.new();
    
    nodeKeyFake = await instance.nodeKeyFromIpfs.call(emptyHash, {from: accounts[0]});
    
    for (var i = 0; i < 10; i++) {
      nodeKey[i] = await instance.nodeKeyFromIpfs.call(hash[i], {from: accounts[0]});
    }
  });
  
  beforeEach("set up contract instance", async () => {
    instance = await InterweaveProposals.new(); // Clean start.
  });
  
  contract("createEdgeProposal", async () => {
    
    it("should error if _slot0 > 5", async () => {
      assert.requireEquals("Both slots must be in the range 0-5.", async () => {
        await instance.createEdgeProposal(nodeKey[0], nodeKey[1], 6, 0, message, {from: accounts[0]});
      });
      
      assert.requireEquals("Both slots must be in the range 0-5.", async () => {
        await instance.createEdgeProposal(nodeKey[0], nodeKey[1], 10, 0, message, {from: accounts[0]});
      });
      
      assert.requireEquals("Both slots must be in the range 0-5.", async () => {
        await instance.createEdgeProposal(nodeKey[0], nodeKey[1], 500, 0, message, {from: accounts[0]});
      });
    });
    
    it("should error if _slot1 > 5", async () => {
      assert.requireEquals("Both slots must be in the range 0-5.", async () => {
        await instance.createEdgeProposal(nodeKey[0], nodeKey[1], 0, 6, message, {from: accounts[0]});
      });
      
      assert.requireEquals("Both slots must be in the range 0-5.", async () => {
        await instance.createEdgeProposal(nodeKey[0], nodeKey[1], 0, 10, message, {from: accounts[0]});
      });
      
      assert.requireEquals("Both slots must be in the range 0-5.", async () => {
        await instance.createEdgeProposal(nodeKey[0], nodeKey[1], 0, 500, message, {from: accounts[0]});
      });
    });
    
    it("should error if both _slot0 and _slot1 > 5", async () => {
      assert.requireEquals("Both slots must be in the range 0-5.", async () => {
        await instance.createEdgeProposal(nodeKey[0], nodeKey[1], 6, 6, message, {from: accounts[0]});
      });
      
      assert.requireEquals("Both slots must be in the range 0-5.", async () => {
        await instance.createEdgeProposal(nodeKey[0], nodeKey[1], 10000, 10000, message, {from: accounts[0]});
      });
    });
    
    it("should error if no Node at _nodeKey0", async () => {
      
      // nodeKeyFake is always fake
      // nodeKey1 is now real:
      await instance.createNode(hash[1], {from: accounts[0]});
      
      assert.requireEquals("You must own the Node at _nodeKey0 in order to manage its edge Nodes, or it might not even exist.", async () => {
        await instance.createEdgeProposal(nodeKeyFake, nodeKey[1], 0, 0, message, {from: accounts[0]});
      });
    });
    
    it("should error if Node at _nodeKey0 not owned by msg.sender", async () => {
      
      // nodeKey0 is owned by 1
      await instance.createNode(hash[0], {from: accounts[1]});
      
      // nodeKey1 is owned by 1
      await instance.createNode(hash[1], {from: accounts[1]});
      
      assert.requireEquals("You must own the Node at _nodeKey0 in order to manage its edge Nodes, or it might not even exist.", async () => {
        await instance.createEdgeProposal(nodeKey[0], nodeKey[1], 0, 0, message, {from: accounts[0]});
      });
    });
    
    it("should error if no Node at _nodeKey1", async () => {
      
      // nodeKey0 is owned by 0
      await instance.createNode(hash[0], {from: accounts[0]});
      // nodeKeyFake is always fake
      
      assert.requireEquals("The Node at _nodeKey1 must exist.", async () => {
        await instance.createEdgeProposal(nodeKey[0], nodeKeyFake, 0, 0, message, {from: accounts[0]});
      });
    });
    
    it("should error if the Node at _nodeKey0 has a third Node's key in its _slot0", async () => {
      
      // nodeKey0 is owned by 0
      await instance.createNode(hash[0], {from: accounts[0]});
      
      // nodeKey1 is owned by 1
      await instance.createNode(hash[1], {from: accounts[1]});
      
      // nodeKey2 is owned by 1
      await instance.createNode(hash[2], {from: accounts[1]});
      
      // nodeKey1 and nodeKey2 are connected already (both owned by 1 = instant connection)
      await instance.createEdgeProposal(nodeKey[1], nodeKey[2], 0, 0, message, {from: accounts[1]});
      
      assert.requireEquals("The Nodes slots at _nodeKey0 _slot0 and _nodeKey1 _slot1 must be either both connected to each other or both disconnected from any Node.", async () => {
        // 1 attempts to connect nodeKey1 to nodeKey0 on slots 0,0, but 1's nodeKey1 already connected on slot 0.
        await instance.createEdgeProposal(nodeKey[1], nodeKey[0], 0, 0, message, {from: accounts[1]});
      });
    });
    
    it("should error if the Node at _nodeKey1 has a third Node's key in its _slot1", async () => {
      
      // nodeKey0 is owned by 0
      await instance.createNode(hash[0], {from: accounts[0]});
      
      // nodeKey1 is owned by 1
      await instance.createNode(hash[1], {from: accounts[1]});
      
      // nodeKey2 is owned by 1
      await instance.createNode(hash[2], {from: accounts[1]});
      
      // nodeKey1 and nodeKey2 are connected already (both owned by 1 = instant connection)
      await instance.createEdgeProposal(nodeKey[1], nodeKey[2], 0, 0, message, {from: accounts[1]});
      
      assert.requireEquals("The Nodes slots at _nodeKey0 _slot0 and _nodeKey1 _slot1 must be either both connected to each other or both disconnected from any Node.", async () => {
        // 0 attempts to connect nodeKey0 to nodeKey1 on slots 0, 0, but 1's nodeKey1 already connected on slot 0.
        await instance.createEdgeProposal(nodeKey[0], nodeKey[1], 0, 0, message, {from: accounts[0]});
      });
    });
    
    it("should error if the same EdgeProposal already exists", async () => {
      
      // nodeKey0 is owned by 0
      await instance.createNode(hash[0], {from: accounts[0]});
      
      // nodeKey1 is owned by 1
      await instance.createNode(hash[1], {from: accounts[1]});
      
      // nodeKey0 and nodeKey1 have an EdgeProposal on 4, 2 already (different owners, so proposal).
      await instance.createEdgeProposal(nodeKey[0], nodeKey[1], 4, 2, message, {from: accounts[0]});
      
      assert.requireEquals("This exact EdgeProposal already exists. You can reject it if you want.", async () => {
        // 0 attempts to create the same nodeKey0 and nodeKey1 on 4, 2 proposal
        await instance.createEdgeProposal(nodeKey[0], nodeKey[1], 4, 2, message, {from: accounts[0]});
      });
    });
    
    it("should error if the reverse EdgeProposal already exists", async () => {
      
      // nodeKey0 is owned by 0
      await instance.createNode(hash[0], {from: accounts[0]});
      
      // nodeKey1 is owned by 1
      await instance.createNode(hash[1], {from: accounts[1]});
      
      // nodeKey0 and nodeKey1 have an EdgeProposal on 4, 2 already (different owners, so proposal).
      await instance.createEdgeProposal(nodeKey[0], nodeKey[1], 4, 2, message, {from: accounts[0]});
      
      assert.requireEquals("The reverse of this EdgeProposal already exists. You can either reject or accept it.", async () => {
        // 1 attempts to create the reverse nodeKey1 to nodeKey1 on 2, 4 EdgeProposal
        await instance.createEdgeProposal(nodeKey[1], nodeKey[0], 2, 4, message, {from: accounts[1]});
      });
      
    });
    
    it("should result in connected Nodes and an EdgeCreated event if they're both msg.sender's and they were both 0 before", async () => {
      
      // nodeKey0 is owned by 0
      await instance.createNode(hash[0], {from: accounts[0]});
      
      // nodeKey1 is owned by 0
      await instance.createNode(hash[1], {from: accounts[0]});
      
      let tx = await instance.createEdgeProposal(nodeKey[0], nodeKey[1], 2, 3, message, {from: accounts[0]});
      
      // Make sure the correct EdgeCreated event was emitted.
      assert.eventHappenedOnce(tx, "EdgeCreated", {
        nodeKey0: nodeKey[0],
        nodeKey1: nodeKey[1],
        slot0: 2,
        slot1: 3,
        ownerAddr0: accounts[0],
        ownerAddr1: accounts[0]
      });
      
      // Make sure no EdgeProposalCreated event was emitted.
      assert.eventNeverHappened(tx, "EdgeProposalCreated");
      
      // Make sure no EdgeProposal was actually created.
      let hypotheticalEdgeProposalKey = await instance.edgeProposalKeyFromNodesAndSlots(nodeKey[0], nodeKey[1], 2, 3);
      
      assert.requireEquals("The EdgeProposal at _edgeProposalKey must exist.", async () => {
        // 1 attempts to create the reverse nodeKey1 to nodeKey1 on 2, 4 EdgeProposal
        await instance.getEdgeProposal(hypotheticalEdgeProposalKey);
      });
      
      // Make sure the Nodes were connected.
      let node0 = await instance.getNode(nodeKey[0], {from: accounts[0]});
      let node1 = await instance.getNode(nodeKey[1], {from: accounts[0]});
      
      assert.equal(node0[2][2].toString(), nodeKey[1].toString());
      assert.equal(node1[2][3].toString(), nodeKey[0].toString());
      
    });
    
    it("should result in disconnected Nodes and an EdgeDeleted event if they're both msg.sender's and they were both each other before", async () => {
      // nodeKey0 is owned by 0
      await instance.createNode(hash[0], {from: accounts[0]});
      
      // nodeKey1 is owned by 0
      await instance.createNode(hash[1], {from: accounts[0]});
      
      // Connect the Nodes (we just tested it in the previous test)
      await instance.createEdgeProposal(nodeKey[0], nodeKey[1], 2, 3, message, {from: accounts[0]});
      
      // Disconnect them using the same code.
      let tx = await instance.createEdgeProposal(nodeKey[0], nodeKey[1], 2, 3, message, {from: accounts[0]});
      
      // Make sure the correct EdgeDeleted event was emitted.
      assert.eventHappenedOnce(tx, "EdgeDeleted", {
        nodeKey0: nodeKey[0],
        nodeKey1: nodeKey[1],
        slot0: 2,
        slot1: 3,
        ownerAddr0: accounts[0],
        ownerAddr1: accounts[0]
      });
      
      // Make sure no EdgeProposalCreated event was emitted.
      assert.eventNeverHappened(tx, "EdgeProposalCreated");
      
      // Make sure no EdgeProposal was actually created.
      let hypotheticalEdgeProposalKey = await instance.edgeProposalKeyFromNodesAndSlots(nodeKey[0], nodeKey[1], 2, 3);
      
      assert.requireEquals("The EdgeProposal at _edgeProposalKey must exist.", async () => {
        // 1 attempts to create the reverse nodeKey1 to nodeKey1 on 2, 4 EdgeProposal
        await instance.getEdgeProposal(hypotheticalEdgeProposalKey);
      });
      
      // Make sure the Nodes were disconnected.
      let node0 = await instance.getNode(nodeKey[0], {from: accounts[0]});
      let node1 = await instance.getNode(nodeKey[1], {from: accounts[0]});
      
      assert.equal(node0[2][2].toString(), "0");
      assert.equal(node1[2][3].toString(), "0");
    });
    
    it("should result, if different owners, in the a new EdgeProposal with the correct getEdgeProposal values and an EdgeProposalCreated event", async () => {
      // nodeKey0 is owned by 0
      await instance.createNode(hash[0], {from: accounts[0]});
      
      // nodeKey1 is owned by 1
      await instance.createNode(hash[1], {from: accounts[1]});
      
      // Get the edgeProposalKey
      let edgeProposalKey = await instance.edgeProposalKeyFromNodesAndSlots(nodeKey[0], nodeKey[1], 2, 3);
      
      // Create the EdgeProposal
      let tx = await instance.createEdgeProposal(nodeKey[0], nodeKey[1], 2, 3, message, {from: accounts[0]});
      
      // Make sure the EdgeProposalCreated event was emitted
      assert.eventHappenedOnce(tx, "EdgeProposalCreated", {
        edgeProposalKey: edgeProposalKey,
        proposerAddr: accounts[0],
        proposedToAddr: accounts[1]
      });
      
      // Make sure there no EdgeCreated event was emitted.
      assert.eventNeverHappened(tx, "EdgeCreated");
      
      // Make sure the new EdgeProposal contains the correct values
      let edgeProposal = await instance.getEdgeProposal(edgeProposalKey);
      
      assert.equal(edgeProposal[0].toString(), nodeKey[0].toString());
      assert.equal(edgeProposal[1].toString(), nodeKey[1].toString());
      assert.equal(edgeProposal[2].toString(), message.toString());
      assert.equal(edgeProposal[3], 2);
      assert.equal(edgeProposal[4], 3);
      assert.equal(edgeProposal[5], true); // valid
      assert.equal(edgeProposal[6], true); // connect
      
      // Make sure the Nodes were not actually changed.
      let node0 = await instance.getNode(nodeKey[0], {from: accounts[0]});
      let node1 = await instance.getNode(nodeKey[1], {from: accounts[0]});
      
      assert.equal(node0[2][2].toString(), "0");
      assert.equal(node1[2][3].toString(), "0");
    });
    
    it("should not error if the same msg.sender makes another EdgeProposal pointing from the same Node0 slot to a different Node1 slot (if in valid configuration)", async () => {
      
      // nodeKey0 is owned by 0
      await instance.createNode(hash[0], {from: accounts[0]});
      
      // nodeKey1 is owned by 1
      await instance.createNode(hash[1], {from: accounts[1]});
      
      // Create EdgeProposal from n0.2 to n1.3
      await instance.createEdgeProposal(nodeKey[0], nodeKey[1], 2, 3, message, {from: accounts[0]});
      
      // Create EdgeProposal from n0.2 to n1.5
      await instance.createEdgeProposal(nodeKey[0], nodeKey[1], 2, 5, message, {from: accounts[0]});
      
      // No errors = success.
    });
    
    it("should not error if another person makes another EdgeProposal pointing to the same Node0 slot from an arbitrary slot on a third Node", async () => {
      // nodeKey0 is owned by 0
      await instance.createNode(hash[0], {from: accounts[0]});
      
      // nodeKey1 is owned by 1
      await instance.createNode(hash[1], {from: accounts[1]});
      
      // nodeKey2 = is owned by 2
      await instance.createNode(hash[2], {from: accounts[2]});
      
      // Create EdgeProposal from n0.2 to n1.3
      await instance.createEdgeProposal(nodeKey[0], nodeKey[1], 2, 3, message, {from: accounts[0]});
      
      // Create EdgeProposal from n2.0 to n0.2
      await instance.createEdgeProposal(nodeKey[2], nodeKey[0], 0, 2, message, {from: accounts[2]});
      
      // No errors = success.
    });
  });
  /*
  contract("acceptEdgeProposal", async () => {
    
    it("should error if there's no EdgeProposal at _edgeProposalKey", async () => {
      
    });
    
    it("should error if msg.sender doesn't own the Node at the EdgeProposal's nodeKey1", async () => {
      
    });
    
    it("should error if EdgeProposal is invalid due to the Node at the EdgeProposal's nodeKey0 being connected to a third Node", async () => {
      
    });
    
    it("should error if EdgeProposal is invalid due to the Node at the EdgeProposal's nodeKey1 being connected to a third Node", async () => {
      
    });
    
    it("should disconnect the Nodes if they are currently connected and emit an EdgeDeleted event with the correct values", async () => {
      
    });
    
    it("should connect the Nodes if they are currently disconnected and emit an EdgeCreated event with the correct values", async () => {
      
    });
    
    it("should result in getEdgeProposal erroring for _edgeProposalKey due to having been deleted from edgeProposalLookup", async () => {
      
    });
    
    it("should result in an EdgeProposalAccepted event with correct values", async () => {
      
    });
    
  });
  
  contract("rejectEdgeProposal", async() => {
    
    it("should error if no EdgeProposal at _edgeProposalKey", async () => {
      
    });
    
    it("should error if neither of the Nodes at the EdgeProposal's nodeKeys is owned by msg.sender ", async () => {
      
    });
    
    it("should, when successful, emit an EdgeProposalRejected event with the correct values", async () => {
      
    });
    
    it("should, when successful, result in getEdgeProposal on the deleted EdgeProposal erroring", async () => {
      
    });
    
    it("should, when successful, allow subsequent createEdgeProposals along the same edge to succeed", async () => {
      
    });
    
  });
  
  contract("getEdgeProposal", async() => {
    
    it("should error if no EdgeProposal at _edgeProposalKey", async () => {
      
    });
    
    it("should return correct EdgeProposal nodeKey[0], nodeKey[1], slot0, slot1, and message values for several EdgeProposals", async () => {
      
    });
    
    it("should return valid for an EdgeProposal referring to two Nodes connected to each other via the referenced slots", async () => {
      
    });
    
    it("should return valid for an EdgeProposal referring to two Nodes not connected to anything on the referenced slots", async () => {
      
    });
    
    it("should return invalid for an EdgeProposal referring to two Nodes where one or the other are pointed to a third Node", async () => {
      
    });
    
    it("should return connect = true for an EdgeProposal referring to two Nodes not connected to anything on the referenced slots", async () => {
      
    });
    
    it("should return connect = false for any other case, valid or otherwise", async () => {
      
    });
  });
  
  contract("deleteNode", async() => {
    
    it("should, when a valid deletion, not give errors even if the Node has EdgeProposals", async () => {
      
    });
    
    it("should result in getEdgeProposal returning invalid afterwards", async () => {
      
    });
    
    it("should give an error if the Node at _nodeKey has >0 edgeNodeKeys set to nonzero values", async () => {
      
    });
  });
  
  // createNode
  // - getNode afterwards should contain all six edgeNodeKeys as 0.
  */
});
