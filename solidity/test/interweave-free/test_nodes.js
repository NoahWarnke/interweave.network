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

contract('InterweaveGraph', async (accounts) => {
  
  let instance = undefined;
  
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
  
  contract("Creating 0 nodes", async() => {
    it("should give 0 nodes belonging to owner before any are created", async () => {
      let numNodes = await instance.getSenderNodeCount.call({from: accounts[0]});
      assert.equal(numNodes, 0);
    });
    
    it("and give an error when you try to access their 0th node", async () => {
      await assert.requireEquals("The index supplied was >= the number of the Nodes belonging to the Owner.", async() => {
        let nodeAddr = await instance.getSenderNodeAddrByIndex.call(0, {from: accounts[0]});
      });
    });
  });
  
  contract("Creating 1 node", async () => {
    let nodeAddr = undefined;
    
    before("create node", async () => {
      // Grab the address of the new Node that will be created.
      nodeAddr = await instance.addressFromAddressAndIpfs.call(accounts[0], hash0, {from: accounts[0]});
      
      // Then actually run the function, which will create the node with the address we just calculated.
      await instance.createNode(hash0, 42, {from: accounts[0]});
    });
    
    it("should have getSenderNodeCount give 1 as the number of sender nodes after calling createNode once", async () => {
      let numNodes = await instance.getSenderNodeCount.call({from: accounts[0]});
      assert.equal(numNodes, 1);
    });
    
    it("should have getSenderNodeAddrByIndex give the same address as the one returned by createNode", async () => {
      let senderNodeAddr0 = await instance.getSenderNodeAddrByIndex.call(0, {from: accounts[0]});
      assert.equal(senderNodeAddr0, nodeAddr);
    });
    
    it("should have getNode return the same information that we sent when we created the node", async () => {
      
      let node = await instance.getNode(nodeAddr, {from: accounts[0]});
      let ipfs = node[0];
      let format = node[1];
      let senderIsOwner = node[2];
      
      assert.equal(ipfs[0], hash0[0]);
      assert.equal(ipfs[1], hash0[1]);
      assert.equal(format, 42);
      
      // No comment on the halfEdgeAddrs. See test_halfedges.js for that.
    });
    
    it("should have getNode return senderIsOwner true for an owner and false for a non-owner caller", async () => {
      let node0 = await instance.getNode(nodeAddr, {from: accounts[0]});
      let node1 = await instance.getNode(nodeAddr, {from: accounts[1]});
      
      assert.equal(node0[2], true);
      assert.equal(node1[2], false);
    });
  });
  
  contract("Creating a second node with the same ipfs for the same owner", async () => {
    let nodeAddr0 = undefined;
    let nodeAddr1 = undefined;
    
    before("create nodes", async () => {
      // Grab the address of the new Nodes that will be created.
      nodeAddr0 = await instance.addressFromAddressAndIpfs.call(accounts[0], hash0, {from: accounts[0]});
      
      // Then actually run the function twice, which will create the nodes with the addresses we just calculated.
      await instance.createNode(hash0, 42, {from: accounts[0]});
    });
    
    it("should give an error, even if the format is different", async () => {
      
      await assert.requireEquals("You already own a node with _ipfs!", async() => {
        await instance.createNode(hash0, 42, {from: accounts[0]});
      });
      
      await assert.requireEquals("You already own a node with _ipfs!", async() => {
        await instance.createNode(hash0, 44, {from: accounts[0]});
      });
    });
  });
  
  contract("Creating 2 different nodes for the same owner", async () => {
    let nodeAddr0 = undefined;
    let nodeAddr1 = undefined;
    
    before("create nodes", async () => {
      // Grab the address of the new Nodes that will be created.
      nodeAddr0 = await instance.addressFromAddressAndIpfs.call(accounts[0], hash0, {from: accounts[0]});
      nodeAddr1 = await instance.addressFromAddressAndIpfs.call(accounts[0], hash1, {from: accounts[0]});
      
      // Then actually run the function twice, which will create the nodes with the addresses we just calculated.
      await instance.createNode(hash0, 42, {from: accounts[0]});
      await instance.createNode(hash1, 44, {from: accounts[0]});
    });
    
    it("should have getSenderNodeCount give 2 as the number of sender nodes after calling createNode twice", async () => {
      let numNodes = await instance.getSenderNodeCount.call({from: accounts[0]});
      assert.equal(numNodes, 2);
    });
    
    it("should have getSenderNodeAddrByIndex give the correct nodeAddrs after calling createNode twice", async () => {
      let senderNodeAddr0 = await instance.getSenderNodeAddrByIndex.call(0, {from: accounts[0]});
      let senderNodeAddr1 = await instance.getSenderNodeAddrByIndex.call(1, {from: accounts[0]});
      assert.equal(senderNodeAddr0, nodeAddr0);
      assert.equal(senderNodeAddr1, nodeAddr1);
    });
    
    it("should have getNode return the same information for each node that we sent when we created them", async () => {
      
      // node 0
      let node = await instance.getNode(nodeAddr0, {from: accounts[0]});
      let ipfs = node[0];
      let format = node[1];
      
      assert.equal(ipfs[0], hash0[0]);
      assert.equal(ipfs[1], hash0[1]);
      assert.equal(format, 42);
      
      // node 1
      node = await instance.getNode(nodeAddr1, {from: accounts[0]});
      ipfs = node[0];
      format = node[1];
      
      assert.equal(ipfs[0], hash1[0]);
      assert.equal(ipfs[1], hash1[1]);
      assert.equal(format, 44);
      
      // No comment on the halfEdgeAddrs. See test_halfedges.js for that.
    });
    
    it("should have getNode return senderIsOwner true for the owner and false for a non-owner caller for each of the two created nodes", async () => {
      let node0sender0 = await instance.getNode(nodeAddr0, {from: accounts[0]});
      let node0sender1 = await instance.getNode(nodeAddr0, {from: accounts[1]});
      let node1sender0 = await instance.getNode(nodeAddr1, {from: accounts[0]});
      let node1sender1 = await instance.getNode(nodeAddr1, {from: accounts[1]});
      
      assert.equal(node0sender0[2], true);
      assert.equal(node0sender1[2], false);
      assert.equal(node1sender0[2], true);
      assert.equal(node1sender1[2], false);
    });
  });
  
  
  contract("Creating 2 different nodes with different owners", async () => {
    let nodeAddr0 = undefined;
    let nodeAddr1 = undefined;
    
    before("create nodes", async () => {
      // Grab the address of the new Nodes that will be created.
      nodeAddr0 = await instance.addressFromAddressAndIpfs.call(accounts[0], hash0, {from: accounts[0]});
      nodeAddr1 = await instance.addressFromAddressAndIpfs.call(accounts[1], hash1, {from: accounts[1]});
      
      // Then actually run the function twice, which will create the nodes with the addresses we just calculated.
      await instance.createNode(hash0, 42, {from: accounts[0]});
      await instance.createNode(hash1, 44, {from: accounts[1]});
    });
    
    it("should have getSenderNodeCount give 1 as the number of sender nodes for each owner", async () => {
      let numNodes0 = await instance.getSenderNodeCount.call({from: accounts[0]});
      let numNodes1 = await instance.getSenderNodeCount.call({from: accounts[1]});
      assert.equal(numNodes0, 1);
      assert.equal(numNodes1, 1);
    });
    
    it("should have getSenderNodeAddrByIndex give the correct nodeAddrs at 0 for each owner", async () => {
      let senderNodeAddr0 = await instance.getSenderNodeAddrByIndex.call(0, {from: accounts[0]});
      let senderNodeAddr1 = await instance.getSenderNodeAddrByIndex.call(0, {from: accounts[1]});
      assert.equal(senderNodeAddr0, nodeAddr0);
      assert.equal(senderNodeAddr1, nodeAddr1);
    });
    
    it("should have getNode return the same information for each node that we sent when we created them", async () => {
      
      // node 0
      let node = await instance.getNode(nodeAddr0, {from: accounts[0]});
      let ipfs = node[0];
      let format = node[1];
      
      assert.equal(ipfs[0], hash0[0]);
      assert.equal(ipfs[1], hash0[1]);
      assert.equal(format, 42);
      
      // node 1
      node = await instance.getNode(nodeAddr1, {from: accounts[1]});
      ipfs = node[0];
      format = node[1];
      
      assert.equal(ipfs[0], hash1[0]);
      assert.equal(ipfs[1], hash1[1]);
      assert.equal(format, 44);
      
      // No comment on the halfEdgeAddrs. See test_halfedges.js for that.
    });
    
    it("should have getNode return senderIsOwner true for only for the owner of each of the two created nodes", async () => {
      let node0sender0 = await instance.getNode(nodeAddr0, {from: accounts[0]});
      let node0sender1 = await instance.getNode(nodeAddr0, {from: accounts[1]});
      let node1sender0 = await instance.getNode(nodeAddr1, {from: accounts[0]});
      let node1sender1 = await instance.getNode(nodeAddr1, {from: accounts[1]});
      
      assert.equal(node0sender0[2], true);
      assert.equal(node0sender1[2], false);
      assert.equal(node1sender0[2], false);
      assert.equal(node1sender1[2], true);
    });
  });
  
  // deleting nodes
  
  // invalid deletes:
  // - Deleting a node that was never created should error
  // - Deleting a node that someone else created should error
  // - (for edges) deleting a node with edges should error
  
  // deleting one node after creating one node:
  // - getSenderNodeCount should be 0 again
  // - getSenderNodeAddrByIndex at 0 should give an error
  // - getNode on the original nodeAddr should give an error
  
  // Creating the same node after deleting it (allowed)
  
  // creating up to 3 nodes and then deleting them back to 0 again
  
  // deleting one node after two accounts create one node each
  
  // deleting 2 nodes each after 2 accounts create 2 nodes each
  
});
