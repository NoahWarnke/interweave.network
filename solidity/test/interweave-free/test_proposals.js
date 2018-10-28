var assert = require('assert');
const InterweaveFreeProposals = artifacts.require("InterweaveFreeProposals");

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

contract('InterweaveFreeProposals', async (accounts) => {
  
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
    instance = await InterweaveFreeProposals.new();
    
    nodeKeyFake = await instance.nodeKeyFromIpfs.call(emptyHash, {from: accounts[0]});
    
    for (var i = 0; i < 10; i++) {
      nodeKey[i] = await instance.nodeKeyFromIpfs.call(hash[i], {from: accounts[0]});
    }
  });
  
  contract("createEdgeProposal", async () => {
    
    beforeEach("set up contract instance", async () => {
      instance = await InterweaveFreeProposals.new(); // Clean start.
    });
    
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
      let hypotheticalEdgeProposalKey = await instance.edgeProposalKeyFromNodesAndSlots.call(nodeKey[0], nodeKey[1], 2, 3);
      
      assert.requireEquals("The EdgeProposal at _edgeProposalKey must exist.", async () => {
        // 1 attempts to create the reverse nodeKey1 to nodeKey1 on 2, 4 EdgeProposal
        await instance.getEdgeProposal.call(hypotheticalEdgeProposalKey);
      });
      
      // Make sure the Nodes were connected.
      let node0 = await instance.getNode.call(nodeKey[0], {from: accounts[0]});
      let node1 = await instance.getNode.call(nodeKey[1], {from: accounts[0]});
      
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
      let hypotheticalEdgeProposalKey = await instance.edgeProposalKeyFromNodesAndSlots.call(nodeKey[0], nodeKey[1], 2, 3);
      
      assert.requireEquals("The EdgeProposal at _edgeProposalKey must exist.", async () => {
        // 1 attempts to create the reverse nodeKey1 to nodeKey1 on 2, 4 EdgeProposal
        await instance.getEdgeProposal.call(hypotheticalEdgeProposalKey);
      });
      
      // Make sure the Nodes were disconnected.
      let node0 = await instance.getNode.call(nodeKey[0], {from: accounts[0]});
      let node1 = await instance.getNode.call(nodeKey[1], {from: accounts[0]});
      
      assert.equal(node0[2][2].toString(), "0");
      assert.equal(node1[2][3].toString(), "0");
    });
    
    it("should result, if different owners, in the a new EdgeProposal with the correct getEdgeProposal values and an EdgeProposalCreated event", async () => {
      // nodeKey0 is owned by 0
      await instance.createNode(hash[0], {from: accounts[0]});
      
      // nodeKey1 is owned by 1
      await instance.createNode(hash[1], {from: accounts[1]});
      
      // Get the edgeProposalKey
      let edgeProposalKey = await instance.edgeProposalKeyFromNodesAndSlots.call(nodeKey[0], nodeKey[1], 2, 3);
      
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
      let edgeProposal = await instance.getEdgeProposal.call(edgeProposalKey);
      
      assert.equal(edgeProposal[0].toString(), nodeKey[0].toString());
      assert.equal(edgeProposal[1].toString(), nodeKey[1].toString());
      assert.equal(edgeProposal[2].toString(), message.toString());
      assert.equal(edgeProposal[3], 2);
      assert.equal(edgeProposal[4], 3);
      assert.equal(edgeProposal[5], true); // valid
      assert.equal(edgeProposal[6], true); // connect
      
      // Make sure the Nodes were not actually changed.
      let node0 = await instance.getNode.call(nodeKey[0], {from: accounts[0]});
      let node1 = await instance.getNode.call(nodeKey[1], {from: accounts[0]});
      
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
  
  contract("acceptEdgeProposal", async () => {
    
    
    beforeEach("set up contract instance", async () => {
      instance = await InterweaveFreeProposals.new(); // Clean start.
    });
    
    it("should error if there's no EdgeProposal at _edgeProposalKey", async () => {
      
      // An EdgeProposal that straight-up doesn't exist.
      let hypotheticalEdgeProposalKey = await instance.edgeProposalKeyFromNodesAndSlots.call(nodeKey[5], nodeKey[7], 4, 1);
      
      assert.requireEquals("You must own the EdgeProposal nodeKey1 Node, or the EdgeProposal might not even exist.", async () => {
        await instance.acceptEdgeProposal(hypotheticalEdgeProposalKey, {from: accounts[0]});
      });
    });
    
    it("should error if msg.sender doesn't own the Node at the EdgeProposal's nodeKey1 (but does own the Node at nodeKey0)", async () => {
      // nodeKey0 is owned by 0
      await instance.createNode(hash[0], {from: accounts[0]});
      
      // nodeKey1 is owned by 1
      await instance.createNode(hash[1], {from: accounts[1]});
      
      // Create EdgeProposal from n0.2 to n1.3
      await instance.createEdgeProposal(nodeKey[0], nodeKey[1], 2, 3, message, {from: accounts[0]});
      
      assert.requireEquals("You must own the EdgeProposal nodeKey1 Node, or the EdgeProposal might not even exist.", async () => {
        await instance.acceptEdgeProposal(hypotheticalEdgeProposalKey, {from: accounts[0]});
      });
    });
    
    it("should error if msg.sender doesn't own the Node at the EdgeProposal's nodeKey1 (or the Node at nodeKey0)", async () => {
      // nodeKey0 is owned by 0
      await instance.createNode(hash[0], {from: accounts[0]});
      
      // nodeKey1 is owned by 1
      await instance.createNode(hash[1], {from: accounts[1]});
      
      // Create EdgeProposal from n0.2 to n1.3
      await instance.createEdgeProposal(nodeKey[0], nodeKey[1], 2, 3, message, {from: accounts[0]});
      
      assert.requireEquals("You must own the EdgeProposal nodeKey1 Node, or the EdgeProposal might not even exist.", async () => {
        await instance.acceptEdgeProposal(hypotheticalEdgeProposalKey, {from: accounts[2]});
      });
    });
    
    it("should error if EdgeProposal is invalid due to the Node at the EdgeProposal's nodeKey0 being connected to a third Node", async () => {
      // nodeKey0 is owned by 0
      await instance.createNode(hash[0], {from: accounts[0]});
      
      // nodeKey1 is owned by 1
      await instance.createNode(hash[1], {from: accounts[1]});
      
      // nodeKey2 is owned by 0
      await instance.createNode(hash[2], {from: accounts[0]});
      
      // Create EdgeProposal from 0's n0.2 to 1's n1.1
      let edgeProposalKey = await instance.edgeProposalKeyFromNodesAndSlots.call(nodeKey[0], nodeKey[1], 2, 1);
      await instance.createEdgeProposal(nodeKey[0], nodeKey[1], 2, 1, message, {from: accounts[0]});
      
      // Connect 0's n0 and n2 from n0.2 to n2.4
      await instance.createEdgeProposal(nodeKey[0], nodeKey[2], 2, 4, message, {from: accounts[0]});
      
      // Now 1 trying to accept the EdgeProposal from n0.2 to n1.1 should fail because n0.2 is now in use elsewhere.
      assert.requireEquals("The Nodes slots at _nodeKey0 _slot0 and _nodeKey1 _slot1 must be either both connected to each other or both disconnected from any Node.", async () => {
        await instance.acceptEdgeProposal(edgeProposalKey, {from: accounts[1]});
      });
    });
    
    it("should error if EdgeProposal is invalid due to the Node at the EdgeProposal's nodeKey1 being connected to a third Node", async () => {
      // nodeKey0 is owned by 0
      await instance.createNode(hash[0], {from: accounts[0]});
      
      // nodeKey1 is owned by 1
      await instance.createNode(hash[1], {from: accounts[1]});
      
      // nodeKey2 is owned by 1
      await instance.createNode(hash[2], {from: accounts[1]});
      
      // Create EdgeProposal from 0's n0.2 to 1's n1.1
      let edgeProposalKey = await instance.edgeProposalKeyFromNodesAndSlots.call(nodeKey[0], nodeKey[1], 2, 1);
      await instance.createEdgeProposal(nodeKey[0], nodeKey[1], 2, 1, message, {from: accounts[0]});
      
      // Connect 1's n1.1 to 1's n2.4
      await instance.createEdgeProposal(nodeKey[1], nodeKey[2], 1, 4, message, {from: accounts[1]});
      
      // Now 1 trying to accept the EdgeProposal from n0.2 to n1.1 should fail because n1.1 is now in use elsewhere.
      assert.requireEquals("The Nodes slots at _nodeKey0 _slot0 and _nodeKey1 _slot1 must be either both connected to each other or both disconnected from any Node.", async () => {
        await instance.acceptEdgeProposal(edgeProposalKey, {from: accounts[1]});
      });
    });
    
    it("should connect the Nodes if they are currently disconnected and emit EdgeCreated and EdgeProposalAccepted events with the correct values", async () => {
      // nodeKey0 is owned by 0
      await instance.createNode(hash[0], {from: accounts[0]});
      
      // nodeKey1 is owned by 1
      await instance.createNode(hash[1], {from: accounts[1]});
      
      // Create EdgeProposal from 0's n0.0 to 1's n1.1
      let edgeProposalKey = await instance.edgeProposalKeyFromNodesAndSlots.call(nodeKey[0], nodeKey[1], 0, 1);
      await instance.createEdgeProposal(nodeKey[0], nodeKey[1], 0, 1, message, {from: accounts[0]});
      
      // 1 accepts the EdgeProposal
      let tx = await instance.acceptEdgeProposal(edgeProposalKey, {from: accounts[1]});
      
      assert.eventHappenedOnce(tx, "EdgeProposalAccepted", {
        edgeProposalKey: edgeProposalKey,
        accepterAddr: accounts[1],
        acceptedAddr: accounts[0]
      });
      
      assert.eventHappenedOnce(tx, "EdgeCreated", {
        nodeKey0: nodeKey[0],
        nodeKey1: nodeKey[1],
        slot0: 0,
        slot1: 1,
        ownerAddr0: accounts[0],
        ownerAddr1: accounts[1]
      });
      
      // Make sure the Nodes were connected.
      let node0 = await instance.getNode.call(nodeKey[0], {from: accounts[0]});
      let node1 = await instance.getNode.call(nodeKey[1], {from: accounts[0]});
      
      assert.equal(node0[2][0].toString(), nodeKey[1].toString());
      assert.equal(node1[2][1].toString(), nodeKey[0].toString());
      
      // Make sure the EdgeProposal no longer exists.
      assert.requireEquals("The EdgeProposal at _edgeProposalKey must exist.", async () => {
        await instance.getEdgeProposal.call(edgeProposalKey, {from: accounts[1]});
      });
    });
    
    it("should disconnect the Nodes if they are currently connected and emit EdgeProposalAccepted and EdgeDeleted events with the correct values", async () => {
      // nodeKey0 is owned by 0
      await instance.createNode(hash[0], {from: accounts[0]});

      // nodeKey1 is owned by 1
      await instance.createNode(hash[1], {from: accounts[1]});

      // Create EdgeProposal from 0's n0.0 to 1's n1.1
      let edgeProposalKey0 = await instance.edgeProposalKeyFromNodesAndSlots.call(nodeKey[0], nodeKey[1], 0, 1);
      await instance.createEdgeProposal(nodeKey[0], nodeKey[1], 0, 1, message, {from: accounts[0]});

      // 1 accepts the EdgeProposal, meaning the Nodes are now connected.
      await instance.acceptEdgeProposal(edgeProposalKey0, {from: accounts[1]});
      
      // Create EdgeProposal from 1's n1.1 to 0's n0.0 (note, wouldn't have to be the reverse of the earlier one - either could propose)
      let edgeProposalKey1 = await instance.edgeProposalKeyFromNodesAndSlots.call(nodeKey[1], nodeKey[0], 1, 0);
      await instance.createEdgeProposal(nodeKey[1], nodeKey[0], 1, 0, message, {from: accounts[1]});
      
      // 0 accepts the EdgeProposal, meaning the Nodes are now disconnected.
      let tx = await instance.acceptEdgeProposal(edgeProposalKey1, {from: accounts[0]});
      
      // Make sure the events were correct.
      assert.eventHappenedOnce(tx, "EdgeProposalAccepted", {
        edgeProposalKey: edgeProposalKey1,
        accepterAddr: accounts[0],
        acceptedAddr: accounts[1]
      });
      
      assert.eventHappenedOnce(tx, "EdgeDeleted", {
        nodeKey0: nodeKey[1],
        nodeKey1: nodeKey[0],
        slot0: 1,
        slot1: 0,
        ownerAddr0: accounts[1],
        ownerAddr1: accounts[0]
      });
      
      // Make sure the Nodes were disconnected.
      let node0 = await instance.getNode.call(nodeKey[0], {from: accounts[0]});
      let node1 = await instance.getNode.call(nodeKey[1], {from: accounts[0]});

      assert.equal(node0[2][0].toString(), "0");
      assert.equal(node1[2][1].toString(), "0");
      
      // Make sure the EdgeProposal no longer exists.
      assert.requireEquals("The EdgeProposal at _edgeProposalKey must exist.", async () => {
        await instance.getEdgeProposal.call(edgeProposalKey1, {from: accounts[1]});
      });
    });
    
  });
  
  contract("rejectEdgeProposal", async() => {
    
    it("should error if no EdgeProposal at _edgeProposalKey", async () => {
      instance = await InterweaveFreeProposals.new(); // Clean start.
      assert.requireEquals("The EdgeProposal at _edgeProposalKey must exist.", async () => {
        await instance.getEdgeProposal.call(edgeProposalKey1, {from: accounts[1]});
      });
      
    });
    
    it("should error if neither of the Nodes at the EdgeProposal's nodeKeys is owned by msg.sender ", async () => {
      instance = await InterweaveFreeProposals.new(); // Clean start.
      
      // An EdgeProposal that straight-up doesn't exist.
      let hypotheticalEdgeProposalKey = await instance.edgeProposalKeyFromNodesAndSlots.call(nodeKey[5], nodeKey[7], 4, 1);
      
      assert.requireEquals("You must be either the proposer or the proposedTo to reject this EdgeProposal, or it might not even exist.", async () => {
        await instance.rejectEdgeProposal(hypotheticalEdgeProposalKey, {from: accounts[0]});
      });
    });
    
    contract("when successful", async () => {
      
      let edgeProposalKey = undefined;
      let tx = undefined;
      
      before("run the function", async () => {
        instance = await InterweaveFreeProposals.new(); // Clean start.
        
        // nodeKey0 is owned by 0
        await instance.createNode(hash[0], {from: accounts[0]});
        
        // nodeKey1 is owned by 1
        await instance.createNode(hash[1], {from: accounts[1]});
        
        // Create EdgeProposal from 0's n0.0 to 1's n1.1
        edgeProposalKey = await instance.edgeProposalKeyFromNodesAndSlots.call(nodeKey[0], nodeKey[1], 0, 1);
        await instance.createEdgeProposal(nodeKey[0], nodeKey[1], 0, 1, message, {from: accounts[0]});
        
        // 1 rejects the EdgeProposal
        tx = await instance.rejectEdgeProposal(edgeProposalKey, {from: accounts[1]});
      });
      
      it("should emit an EdgeProposalRejected event with the correct values", async () => {
        assert.eventHappenedOnce(tx, "EdgeProposalRejected", {
          edgeProposalKey: edgeProposalKey,
          rejecterAddr: accounts[1],
          rejectedAddr: accounts[0]
        });
      });
      
      it("should result in getEdgeProposal on the deleted EdgeProposal erroring", async () => {
        assert.requireEquals("The EdgeProposal at _edgeProposalKey must exist.", async () => {
          await instance.getEdgeProposal.call(edgeProposalKey, {from: accounts[0]});
        });
      });
      
      it("should allow subsequent createEdgeProposals along the same edge to succeed", async () => {
        
        // Create EdgeProposal from 0's n0.0 to 1's n1.1
        edgeProposalKey = await instance.edgeProposalKeyFromNodesAndSlots.call(nodeKey[0], nodeKey[1], 0, 1);
        await instance.createEdgeProposal(nodeKey[0], nodeKey[1], 0, 1, message, {from: accounts[0]});
        
        // No errors = successful.
      });
    });
  });
  
  contract("getEdgeProposal", async () => {
    let edgeProposalKeyFake = undefined;
    let edgeProposalKey0 = undefined;
    let edgeProposalKey1 = undefined;
    let edgeProposalKey2 = undefined;
    let edgeProposalKey2post = undefined;
    let edgeProposalKey3 = undefined;
    
    let edgeProposal0 = undefined;
    let edgeProposal1 = undefined;
    let edgeProposal2 = undefined;
    let edgeProposal3 = undefined;
    
    before("create proposals", async () => {
      instance = await InterweaveFreeProposals.new(); // Clean start.
      
      // nodeKey0 is owned by 0
      await instance.createNode(hash[0], {from: accounts[0]});
      
      // nodeKey1 is owned by 1
      await instance.createNode(hash[1], {from: accounts[1]});
      
      // nodeKey2 is owned by 2
      await instance.createNode(hash[2], {from: accounts[2]});
      
      // Total spurious edgeProposal key
      edgeProposalKeyFake = await instance.edgeProposalKeyFromNodesAndSlots.call(nodeKey[2], nodeKey[1], 5, 2);
      
      // Proposal for two Nodes (0.0, 1.0) not connected to anything
      edgeProposalKey0 = await instance.edgeProposalKeyFromNodesAndSlots.call(nodeKey[0], nodeKey[1], 0, 0);
      await instance.createEdgeProposal(nodeKey[0], nodeKey[1], 0, 0, message, {from: accounts[0]});
      
      // Proposal for two Nodes (1.1, 2.1) already connected
      edgeProposalKey1 = await instance.edgeProposalKeyFromNodesAndSlots.call(nodeKey[1], nodeKey[2], 1, 1);
      await instance.createEdgeProposal(nodeKey[1], nodeKey[2], 1, 1, message, {from: accounts[1]});
      await instance.acceptEdgeProposal(edgeProposalKey1, {from: accounts[2]});
      await instance.createEdgeProposal(nodeKey[1], nodeKey[2], 1, 1, message, {from: accounts[1]}); // I changed my mind!
      
      // Proposal for two Nodes (0.2, 1.2) where the first (0.2) is pointing to a third (2.2)
      // First, propose 0.2 to 1.2
      edgeProposalKey2 = await instance.edgeProposalKeyFromNodesAndSlots.call(nodeKey[0], nodeKey[1], 2, 2);
      await instance.createEdgeProposal(nodeKey[0], nodeKey[1], 2, 2, message, {from: accounts[0]});
      // Now connect 0.2 to 2.2
      edgeProposalKey2post =  await instance.edgeProposalKeyFromNodesAndSlots.call(nodeKey[0], nodeKey[2], 2, 2);
      await instance.createEdgeProposal(nodeKey[0], nodeKey[2], 2, 2, message, {from: accounts[0]});
      await instance.acceptEdgeProposal(edgeProposalKey2post, {from: accounts[2]});
      
      // Proposal for two Nodes (0.3, 2.3) where the other (2.3) is pointing to a third (1.3)
      // First, propose 0.3 to 2.3
      edgeProposalKey3 = await instance.edgeProposalKeyFromNodesAndSlots.call(nodeKey[0], nodeKey[2], 3, 3);
      await instance.createEdgeProposal(nodeKey[0], nodeKey[2], 3, 3, message, {from: accounts[0]});
      // Now connect 2.3 to 1.3
      let edgeProposalKey3post = await instance.edgeProposalKeyFromNodesAndSlots.call(nodeKey[2], nodeKey[1], 3, 3);
      await instance.createEdgeProposal(nodeKey[2], nodeKey[1], 3, 3, message, {from: accounts[2]});
      await instance.acceptEdgeProposal(edgeProposalKey3post, {from: accounts[1]});
      
    });
    
    it("should error if no EdgeProposal at _edgeProposalKey", async () => {
      assert.requireEquals("The EdgeProposal at _edgeProposalKey must exist.", async () => {
        await instance.getEdgeProposal.call(edgeProposalKeyFake, {from: accounts[0]});
      });
      
      assert.requireEquals("The EdgeProposal at _edgeProposalKey must exist.", async () => {
        await instance.getEdgeProposal.call(edgeProposalKey2post, {from: accounts[0]}); // this one was used up earlier
      });
    });
    
    it("should return correct EdgeProposal nodeKey[0], nodeKey[1], slot0, slot1, and message values for real EdgeProposals", async () => {
      
      // Proposal is for 0.0 to 1.0
      edgeProposal0 = await instance.getEdgeProposal.call(edgeProposalKey0, {from: accounts[0]});
      assert.equal(edgeProposal0[0].toString(), nodeKey[0].toString());
      assert.equal(edgeProposal0[1].toString(), nodeKey[1].toString());
      assert.equal(edgeProposal0[2].toString(), message);
      assert.equal(edgeProposal0[3], 0);
      assert.equal(edgeProposal0[4], 0);
      
      // Proposal is for 1.1 to 2.1
      edgeProposal1 = await instance.getEdgeProposal.call(edgeProposalKey1, {from: accounts[0]});
      assert.equal(edgeProposal1[0].toString(), nodeKey[1].toString());
      assert.equal(edgeProposal1[1].toString(), nodeKey[2].toString());
      assert.equal(edgeProposal1[2].toString(), message);
      assert.equal(edgeProposal1[3], 1);
      assert.equal(edgeProposal1[4], 1);
      
      // Proposal is for 0.2 to 2.2
      edgeProposal2 = await instance.getEdgeProposal.call(edgeProposalKey2, {from: accounts[0]});
      assert.equal(edgeProposal2[0].toString(), nodeKey[0].toString());
      assert.equal(edgeProposal2[1].toString(), nodeKey[1].toString());
      assert.equal(edgeProposal2[2].toString(), message);
      assert.equal(edgeProposal2[3], 2);
      assert.equal(edgeProposal2[4], 2);
      
      // Proposal is for 0.3 to 2.3
      edgeProposal3 = await instance.getEdgeProposal.call(edgeProposalKey3, {from: accounts[0]});
      assert.equal(edgeProposal3[0].toString(), nodeKey[0].toString());
      assert.equal(edgeProposal3[1].toString(), nodeKey[2].toString());
      assert.equal(edgeProposal3[2].toString(), message);
      assert.equal(edgeProposal3[3], 3);
      assert.equal(edgeProposal3[4], 3);
    });
    
    it("should return valid for an EdgeProposal referring to two Nodes not connected to anything on the referenced slots", async () => {
      assert.equal(edgeProposal0[5], true);
    });
    
    it("should return valid for an EdgeProposal referring to two Nodes connected to each other via the referenced slots", async () => {
      assert.equal(edgeProposal1[5], true);
    });
    
    it("should return invalid for an EdgeProposal referring to two Nodes where the first is pointed to a third Node", async () => {
      assert.equal(edgeProposal2[5], false);
    });
    
    it("should return invalid for an EdgeProposal referring to two Nodes where the second is pointed to a third Node", async () => {
      assert.equal(edgeProposal3[5], false);
    });
    
    it("should return connect = true for an EdgeProposal referring to two Nodes not connected to anything on the referenced slots", async () => {
      assert.equal(edgeProposal0[6], true);
    });
    
    it("should return connect = false for any other case, valid or otherwise", async () => {
      assert.equal(edgeProposal1[6], false);
      assert.equal(edgeProposal2[6], false);
      assert.equal(edgeProposal3[6], false);
    });
  });
  
  
  contract("createNode", async() => {
    
    it("should create a Node with all of its edgeNodeKeys empty to start with", async () => {
      instance = await InterweaveFreeProposals.new(); // Clean start.
      
      // Create Node
      await instance.createNode(hash[0], {from: accounts[0]});
      
      let node = await instance.getNode.call(nodeKey[0], {from: accounts[0]});
      
      for (var i = 0; i < 6; i++) {
        assert.equal(node[2][i].toString(), "0");
      }
    });
    
  });
  
  contract("deleteNode", async() => {
    
    it("should give an error if the Node at _nodeKey has >0 edgeNodeKeys set to nonzero values", async () => {
      instance = await InterweaveFreeProposals.new(); // Clean start.
      
      // nodeKey0 is owned by 0
      await instance.createNode(hash[0], {from: accounts[0]});
      
      // nodeKey1 is owned by 0
      await instance.createNode(hash[1], {from: accounts[0]});
      
      // Insta-connect because both Nodes are owned by 0
      await instance.createEdgeProposal(nodeKey[0], nodeKey[1], 1, 1, message, {from: accounts[0]});
      
      assert.requireEquals("You must disconnect this Node from all other Nodes before deleting it.", async () => {
        await instance.deleteNode(nodeKey[0], {from: accounts[0]});
      });
      
      assert.requireEquals("You must disconnect this Node from all other Nodes before deleting it.", async () => {
        await instance.deleteNode(nodeKey[1], {from: accounts[0]});
      });
    });
    
    contract("when successful", async () => {
      
      let edgeProposalKey = undefined;
      
      before("create node with an EdgeProposal", async () => {
        instance = await InterweaveFreeProposals.new(); // Clean start.
        
        // nodeKey0 is owned by 0
        await instance.createNode(hash[0], {from: accounts[0]});
        
        // nodeKey1 is owned by 1
        await instance.createNode(hash[1], {from: accounts[1]});
        
        // Actually creates an EdgeProposal because node1 is owned by 1, not 0.
        edgeProposalKey = await instance.edgeProposalKeyFromNodesAndSlots.call(nodeKey[0], nodeKey[1], 1, 1, {from: accounts[0]});
        await instance.createEdgeProposal(nodeKey[0], nodeKey[1], 1, 1, message, {from: accounts[0]});
        
      });
      
      it("should, when a valid deletion, not give errors even if the Node has EdgeProposals", async () => {
        
        await instance.deleteNode(nodeKey[0], {from: accounts[0]});
        // No errors = success.
      });
      
      it("should result in getEdgeProposal returning invalid afterwards", async () => {
        
        let edgeProposal = await instance.getEdgeProposal.call(edgeProposalKey, {from: accounts[0]});
        
        assert.equal(edgeProposal[5], false);
        
      });
      
    });
    
  });
  
});
