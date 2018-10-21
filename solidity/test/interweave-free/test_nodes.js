var assert = require('assert');
const SetHash = artifacts.require("InterweaveGraph");

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

contract('InterweaveGraph', async (accounts) => {
  
  let instance = undefined;
  const hashUnder32     = "0123456789";
  const hashOver64      = "01234567890123456789012345678901234567890123456789";
  const hashExactly46   = "0123456789012345678901234567890123456789012345";
  const hash0           = "012345678901234567890123456789012345678muffins";
  const hash1           = "01234567890123456789012345678901234567kumquats";
  
  beforeEach("set up contract instance", async () => {
    instance = await InterweaveGraph.deployed();
  })
  
  // Owner has 0 nodes to start
  // Owner node lookup at 0 returns error
  
  // After creating a node (get the result?):
  // - owner node count = 1
  // - owner node lookup at 0 = the address of the node
  // - nodeLookup[nodeAddr].owner = the owner address
  // - nodeLookup[nodeAddr].ipfs = the passed-in hash
  // - nodeLookup[nodeAddr].format = the passed-in format
  
  // After creating two nodes (get the addrs?)
  // - owner node count = 2
  // - owner node lookup of 0 and 1 are both the created node addrs
  
  // After creating 1 node, creating a second with the same ipfs will fail
   
  // 
  
  
  /*
  it("should return the empty string when calling getHash for any given account for which setHash has not yet been called", async () => {
    let account0hash = await instance.getHash.call(accounts[0]);
    assert.equal(account0hash, "");
  });
  */
});
