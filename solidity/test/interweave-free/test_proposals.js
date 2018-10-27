var assert = require('assert');
const InterweaveGraph = artifacts.require("InterweaveGraph");

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

contract('InterweaveProposals', async (accounts) => {
  
  let instance = undefined;
  
  const emptyKey = 0;
  
  const emptyHash = [
    "0x0000000000000000000000000000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000000000000000000000000000"
  ];
  
  // "QmQvJM1kqYns8rr6YC1aFJkHQPD2iGP3t5c74JAnMFrirf" :)
  const hash0 = [
    "0x516d51764a4d316b71596e733872723659433161464a6b485150443269475033",
    "0x74356337344a416e4d4672697266000000000000000000000000000000000000"
  ];
  
  // "kittenskittenskittenskittenskittenskittens" (not a valid, much less existing, IPFS, sadly.)
  const hash1 = [
    "0x6b697474656e736b697474656e736b697474656e736b697474656e736b697474",
    "0x656e736b697474656e7300000000000000000000000000000000000000000000"
  ];
  
  // Converting back to ASCII is left as an exercise for the reader.
  const hash2 = [
    "0x696e6565646162756e63686f66746865736566616b65686173686573666f7261",
    "0x6c6c6f666d79756e697474657374730000000000000000000000000000000000"
  ];
  
  beforeEach("set up contract instance", async () => {
    instance = await InterweaveGraph.deployed();
  })
  
  contract("createEdgeProposal", async() => {
    
    it("should error if _slot0 > 5", async () => {
      
    });
    
    it("should error if _slot1 > 5", async () => {
      
    });
    
    it("should error if no Node at _nodeKey0", async () => {
      
    });
    
    it("should error if Node at _nodeKey0 not owned by msg.sender", async () => {
      
    });
    
    it("should error if no Node at _nodeKey1", async () => {
      
    });
    
    it("should error if the Node at _nodeKey0 has a third Node's key in its _slot0", async () => {
      
    });
    
    it("should error if the Node at _nodeKey1 has a third Node's key in its _slot1", async () => {
      
    });
    
    it("should error if the same EdgeProposal already exists", async () => {
      
    });
    
    it("should error if the reverse EdgeProposal already exists", async () => {
      
    });
    
    it("should result in connected Nodes and an EdgeCreated event if they're both msg.sender's and they were both 0 before", async () => {
      
    });
    
    it("should result in disconnected Nodes and an EdgeDeleted event if they're both msg.sender's and they were both each other before", async () => {
      
    });
    
    it("should result, if different owners, in the a new EdgeProposal with the correct getEdgeProposal values and an EdgeProposalCreated event", async () => {
      
    });
    
    it("should not error if the same msg.sender makes another EdgeProposal pointing from the same Node0 slot to a different Node1 slot (if in valid configuration)", async () => {
      
    });
    
    it("should not error if the same person makes another EdgeProposal pointing to the same Node slot from an arbitrary slot on a third Node", async () => {
      
    });
  });
  
  contract("acceptEdgeProposal", async() => {
    
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
    
    it("should return correct EdgeProposal nodeKey0, nodeKey1, slot0, slot1, and message values for several EdgeProposals", async () => {
      
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
});
