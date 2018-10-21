var assert = require('assert');
const SetHash = artifacts.require("SetHash");

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


contract('SetHash', async (accounts) => {
  
  let instance = undefined;
  const hashUnder46     = "0123456789";
  const hashOver46      = "01234567890123456789012345678901234567890123456789";
  const hashExactly46   = "0123456789012345678901234567890123456789012345";
  const hash0           = "012345678901234567890123456789012345678muffins";
  const hash1           = "01234567890123456789012345678901234567kumquats";
  
  beforeEach("set up contract instance", async () => {
    instance = await SetHash.deployed();
  })
  
  it("should return the empty string when calling getHash for any given account for which setHash has not yet been called", async () => {
    let account0hash = await instance.getHash.call(accounts[0]);
    assert.equal(account0hash, "");
  });
  
  it("should give an appropriate error when calling setHash with an empty string as the hash", async () => {
    await assert.requireEquals("IPFS hashes must be 46 characters long.", async function() {
      await instance.setHash("", {from: accounts[0]});
    });
    
  });
  
  it("should give an appropriate error when calling setHash with a string < 46 characters as the hash", async () => {
    await assert.requireEquals("IPFS hashes must be 46 characters long.", async function() {
      await instance.setHash(hashUnder46, {from: accounts[0]});
    });
    
  });
  
  it("should give an appropriate error when calling setHash with a string > 46 characters as the hash", async () => {
    await assert.requireEquals("IPFS hashes must be 46 characters long.", async function() {
      await instance.setHash(hashOver46, {from: accounts[0]});
    });
    
  });
  
  it("should not give any errors when calling setHash with a string = 46 characters as the hash", async () => {
    await instance.setHash(hashExactly46, {from: accounts[0]});
    // Note: if this threw an error, that would make the test fail.
  });
  
  it("should have getHash return the correct hash after setting it with setHash", async () => {
    await instance.setHash(hash0, {from: accounts[0]});
    
    let returned = await instance.getHash.call(accounts[0]);
    assert.equal(returned, hash0);
  });
  
  it("should not change a different account's hash after setting it for one account with setHash", async () => {
    await instance.setHash(hash0, {from: accounts[0]});
    let returned = await instance.getHash.call(accounts[1]);
    
    assert.equal(returned, "");
  });
  
  it("should have getHash return the correct hash after setting it twice for the same account with setHash", async () => {
    await instance.setHash(hash0, {from: accounts[0]});
    await instance.setHash(hash1, {from: accounts[0]});
    let returned = await instance.getHash.call(accounts[0]);
    
    assert.equal(returned, hash1);
  });
  
  it("should have getHash return the correct hashes for both accounts after setting it twice for different accounts with setHash", async () => {
    await instance.setHash(hash0, {from: accounts[0]});
    await instance.setHash(hash1, {from: accounts[1]});
    
    
    let returned0 = await instance.getHash.call(accounts[0]);
    assert.equal(returned0, hash0);
    
    let returned1 = await instance.getHash.call(accounts[1]);
    assert.equal(returned1, hash1);
  });
  
});
