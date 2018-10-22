// invalid HalfEdge creation
// - empty ipfs
// - nonexistant or not-sender-owned Node
// - Node already has 6 HalfEdge
// - HalfEdge with ipfs already created

// creating 1 HalfEdge
// - getNode should contain halfEdgeCount of 1
// - getNode should contain halfEdgeKeys[0] with the halfEdgeAddr in it
// - getEdge should contain the nodeKey, ipfs, format, and non-connected status for the HalfEdge.

// creating 2 HalfEdges



// - deleting a node with edges should error

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
