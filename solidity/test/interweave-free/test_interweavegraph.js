var assert = require('assert');
const SetHash = artifacts.require("InterweaveGraph");

// Add our own function for testing requires?
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
  const hashUnder46     = "0123456789";
  const hashOver46      = "01234567890123456789012345678901234567890123456789";
  const hashExactly46   = "0123456789012345678901234567890123456789012345";
  const hash0           = "012345678901234567890123456789012345678muffins";
  const hash1           = "01234567890123456789012345678901234567kumquats";
  
  beforeEach("set up contract instance", async () => {
    instance = await InterweaveGraph.deployed();
  })
  /*
  it("should return the empty string when calling getHash for any given account for which setHash has not yet been called", async () => {
    let account0hash = await instance.getHash.call(accounts[0]);
    assert.equal(account0hash, "");
  });
  */
});
