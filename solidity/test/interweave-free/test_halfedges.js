// invalid HalfEdge creation
// - empty ipfs
// - nonexistant or not-sender-owned Node
// - Node already has 6 HalfEdge
// - HalfEdge with ipfs already created

// creating 1 HalfEdge
// - getNode should contain halfEdgeCount of 1
// - getNode should contain halfEdgeKeys[0] with the halfEdgeAddr in it
// - getEdge should contain the nodeKey, ipfs, format, and non-connected status for the HalfEdge.

// Deleting a Node with 1 HalfEdge
// - deleteNode should give an error

// Deleting a HalfEdge when you can't
// - HalfEdge doesn't exist: should error
// - HalfEdge is connected (may need to implement toggleEdge first): should error
// - Node of HalfEdge isn't owned by sender: should error

// Deleting 1 HalfEdge after creating 1
// - getNode should contain halfEdgeCount of 0
// - getNode should contain halfEdgeKeys[0] with 0 in it
// - getEdge should error
 
// Recreating the same HalfEdge after deleting it
// - getNode should contain halfEdgeCount of 1
// - getNode should contain halfEdgeKeys[0] with the halfEdgeAddr in it
// - getEdge should contain the nodeKey, ipfs, format, and non-connected status for the HalfEdge.

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

// Creating HalfEdges on different Nodes of the same owner
// - Both Nodes should have separate limits of 6 and contain their separate data after going to 6.

// Creating HalfEdges on different Nodes of different owners
// - Both Nodes should have separate limits of 6 and contain their separate data after going to 6.






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
  
  contract("", async() => {
    
    it("", async () => {
      
    });
    
  });
});
