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

contract('InterweaveGraphHalfEdges', async (accounts) => {
  
  let instance = undefined;
  
  const emptyKey = 0;
  
  const emptyHash = [
    "0x0000000000000000000000000000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000000000000000000000000000"
  ];
  
  // Prototype (the missing 2 chars of the first elementare intentional)
  const hash = [
    "0x516d51764a4d316b71596e733872723659433161464a6b4851504432694750",
    "0x74356337344a416e4d4672697266000000000000000000000000000000000000"
  ];
  
  // Okay, we're gonna need 14 "real" hashes lol, to test up to 2 Nodes with 6 HalfEdges each.
  let hashes = [];
  for (var i = 0; i < 12; i++) {
    hashes[i] = [
      hash[0] + (i < 10 ? "0" : "") + i,
      hash[1]
    ];
  }
  
  beforeEach("set up contract instance", async () => {
    instance = await InterweaveGraph.deployed();
  })
  
  contract("Creating invalid HalfEdges", async () => {
    
    it("should give an error if the IPFS hash is empty", async () => {
      
    });
    
    it("should give an error if the IPFS hash is already used for a HalfEdge", async () => {
      
    });
    
    it("should give an error if the Node with the specified key is nonexistant", async () => {
      
    });
    
    it("should give an error if the Node with the specified key is owned by someone else", async () => {
      
    });
    
    it("should give an error if the Node with the specified key already has 6 HalfEdges", async () => {
      
    });

  });
  
  contract("Before creating any HalfEdges", async () => {
    
    it("should have getNode return halfEdgeCount of 0", async () => {
      
    });
    
    it("should have GetNode return halfEdgeKeys[0]..[5] with value of 0", async () => {
      
    });
    
    it("should have getEdge give an error for any specific non-created HalfEdge", async () => {
      
    });
    
  });
  
  // creating 1 HalfEdge
  // - getNode should contain halfEdgeCount of 1
  // - getNode should contain halfEdgeKeys[0] with the halfEdgeAddr in it
  // - getEdge should contain the nodeKey, ipfs, format, and non-connected status for the HalfEdge.
  contract("Creating 1 HalfEdge", async () => {
    
    before("create Node", async () => {
      
    });
    
    it("should have getNode return halfEdgeCount of 1", async () => {
      
    });
    
    it("should have getNode return halfEdgeKeys[0] with the halfEdgeAddr in it, and [1]..[5] with value of 0", async () => {
      
    });
    
    it("should have getEdge return the correct nodeKey, ipfs, format, and connected = 0 for the new HalfEdge", async () => {
      
    });
    
  });
  
  // Deleting a Node with 1 HalfEdge
  // - deleteNode should give an error
  contract("Deleting a Node with 1 HalfEdge", async() => {
    
    it("should have deleteNode give an error", async () => {
      
    });
    
  });
  
  // Deleting a HalfEdge when you can't
  // - HalfEdge doesn't exist: should error
  // - HalfEdge is connected: should error
  // - Node of HalfEdge isn't owned by sender: should error
  contract("Deleting invalid HalfEdges", async() => {
    
    it("should give an error if the HalfEdge doesn't exist", async () => {
      
    });
    
    it("should give an error if the HalfEdge is connected to another", async () => {
      
    });
    
    it("should give an error if the HalfEdge's Node isn't owned by the sender", async () => {
      
    });
    
  });
  
  // Deleting 1 HalfEdge after creating 1
  // - getNode should contain halfEdgeCount of 0
  // - getNode should contain halfEdgeKeys[0] with 0 in it
  // - getEdge should error
  contract("Deleting 1 HalfEdge after creating it", async() => {
    
    it("should have getNode return a halfEdgeCount of 0", async () => {
      
    });
    
    it("should have getNode return halfEdgeKeys[0]..[5] with 0s in them", async () => {
      
    });
    
    it("should have getEdge give an error when called on the deleted HalfEdge's key", async () => {
      
    });
    
  });
  
  // Recreating the same HalfEdge after deleting it
  // - getNode should contain halfEdgeCount of 1
  // - getNode should contain halfEdgeKeys[0] with the halfEdgeAddr in it
  // - getEdge should contain the nodeKey, ipfs, format, and non-connected status for the HalfEdge.
  contract("Creating a HalfEdge after deleting one with the same IPFS hash", async() => {
    
    it("should have getNode return a halfEdgeCount of 1", async () => {
      
    });
    
    it("should have getNode return a halfEdgeKeys ", async () => {
      
    });
    
    it("should have getEdge return the correct nodeKey, ipfs, format, and connected = 0 for the recreated HalfEdge", async () => {
      
    });
    
  });
  
  // creating and then deleting 6+ HalfEdges on the same Node
  // - For each step i from 0 to 6:
  // - getNode should contain halfEdgecount of i
  // - getNode should contain halfEdgeKeys with all the existing HalfEdgeKeys in it, and 0s in the rest.
  // - getEdge should contain the nodeKey, ipfs, format, and non-connected status for all i HalfEdges
  // - createHalfEdge should error after 6.
  // - deleting one HalfEdge and then recreating one should work.
  // - For each step i from 6 to 0 (actual selected order could be randomish):
  // - getNode should contain halfEdgecount of i
  // - getNode should contain halfEdgeKeys with all the existing HalfEdgeKeys in it, and 0s in the rest.
  // - getEdge should contain the nodeKey, ipfs, format, and non-connected status for all i HalfEdges
  contract("Creating and then deleting 6+ HalfEdges on the same Node", async() => {
    
    // before: create Node
    
    
    
    
    it("should give correct information and errors at each point during the process", async () => {
      for (var i = 0; i < 6; i++) {
        // Create new HalfEdge i
        
        // call getNode

        // verify halfEdgeCount
          
        for (var j = 0; j < 6; j++) {
          // verify halfEdgeKeys[j]
          // verify getEdge[keyj]
        }
        
      }
    });

    
  });
  
  // Creating HalfEdges on different Nodes of the same owner
  // - Both Nodes should have separate limits of 6 and contain their separate data after going to 6.
  contract("Creating 6 HalfEdges on different Nodes belonging to the same owner", async() => {
    
    // before: create the HalfEdges
    
    it("should allow up to 6 HalfEdges for the first Node, and correctly save the HalfEdge data", async () => {
      
    });
    
    it("should allow up to 6 HalfEdges for the second Node, and correctly save the HalfEdge data", async () => {
      
    });
    
    it("should have createHalfEdge give an error for both Nodes when they have 6 HalfEdges already", async () => {
      
    });
    
  });
  
  // Creating HalfEdges on different Nodes of different owners
  // - Both Nodes should have separate limits of 6 and contain their separate data after going to 6.
  contract("Creating 6 HalfEdges on different Nodes belonging to different owners", async() => {
    
    it("should allow up to 6 HalfEdges for the first owner, and correctly save their HalfEdge data", async () => {
      
    });
    
    it("should allow up to 6 HalfEdges for the second owner, and correctly save their HalfEdge data", async () => {
      
    });
    
    it("should give an error when first owner tries to create a 7th HalfEdge on their Node", async () => {
      
    });
    
    it("should give an error when sedcond owner tries to create a 7th HalfEdge on their Node", async () => {
      
    });
    
  });
  
  // Connecting and disconnecting HalfEdges invalidly with toggleEdge
  // - key0 doesn't exist: error
  // - key1 doesn't exist: error
  // - key0 and key1 don't exist: error
  // - key0 doesn't belong to owner: error
  // - key1 doesn't belong to owner: error
  // - key0 and key1 don't belong to owner: error
  // - key0 points to someone else: error
  // - key1 points to someone else: error
  // - key0 points to key1, key1 points nowhere: error (actually, this case is impossible)
  // - key1 points to key0, key0 points nowhere: error (actually, this case is impossible)
  contract("Connecting/disconnecting HalfEdges in invalid situations with toggleEdge", async() => {
    
    it("should give an error if key0 is 0", async () => {
      
    });
    
    it("should give an error if key1 is 0", async () => {
      
    });
    
    it("should give an error if key0 doesn't exist", async () => {
      
    });
    
    it("should give an error if key1 doesn't exist", async () => {
      
    });
    
    it("should give an error if both key0 and key1 don't exist", async () => {
      
    });
    
    it("should give an error if key0 doesn't belong to sender", async () => {
      
    });
    
    it("should give an error if key1 doesn't belong to sender", async () => {
      
    });
    
    it("should give an error if both key0 and key1 don't belong to sender", async () => {
      
    });
    
    it("should give an error if key0's otherHalfEdgeKey is not 0 and not key1", async () => {
      
    });
    
    it("should give an error if key1's otherHalfEdgeKey is not 0 and not key0", async () => {
      
    });
    
  });
  
  // Connecting HalfEdges with toggleEdge
  // - Should have each other as otherHalfEdgeKeys
  contract("Connecting HalfEdges with toggleEdge", async() => {
    // Before: create Nodes and HalfEdgse
    
    it("should result in the HalfEdges having each other as otherHalfEdgeKeys", async () => {
      
    });
    
  });
  
  // Disconnecting HalfEdges with toggleEdge
  // - Should have 0 as otherHalfEdgeKeys
  contract("Disconnecting HalfEdges with toggleEdge", async() => {
    // Before: create Nodes and HalfEdges
    
    it("should result in the HalfEdges each having 0 as their otherHalfEdgeKeys", async () => {
      
    });
    
  });

});
