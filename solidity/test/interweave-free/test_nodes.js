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

contract('InterweaveGraph Nodes', async (accounts) => {
  
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
  
  contract("Before creating any Nodes", async() => {
    
    it("should give 0 nodes belonging to sender", async () => {
      let numNodes = await instance.getSenderNodeCount.call({from: accounts[0]});
      assert.equal(numNodes, 0);
    });
    
    it("should give an error when you try to access the sender's 0th Node", async () => {
      await assert.requireEquals("The index supplied was >= the number of the Nodes belonging to the Owner.", async() => {
        let nodeKey = await instance.getSenderNodeKeyByIndex.call(0, {from: accounts[0]});
      });
    });
    
    it("should give an error when you try to access a Node at key 0", async () => {
      assert.requireEquals("Node does not exist.", async () => {
        let node = await instance.getNode.call(emptyKey, {from: accounts[0]});
      });
    });
  });
  
  contract("Creating 1 Node with invalid (all 0s) ipfs hash", async () => {
    
    it("Should give an error", async () => {
      await assert.requireEquals("_ipfs[0] was empty!", async() => {
        await instance.createNode(emptyHash, 42, {from: accounts[0]});
      });
    });
  });
  
  contract("Creating 1 Node", async () => {
    let nodeKey = undefined;
    
    before("create Node", async () => {
      // Grab the key of the new Node that will be created.
      nodeKey = await instance.keyFromIpfs.call(hash0, {from: accounts[0]});
      
      // Then actually run the function, which will create the node with the key we just calculated.
      await instance.createNode(hash0, 42, {from: accounts[0]});
    });
    
    it("should have getSenderNodeCount give 1 as the number of sender Nodes after calling createNode once", async () => {
      let numNodes = await instance.getSenderNodeCount.call({from: accounts[0]});
      assert.equal(numNodes, 1);
    });
    
    it("should have getSenderNodeKeyByIndex give the same key as the one returned by createNode", async () => {
      let senderNodeKey0 = await instance.getSenderNodeKeyByIndex.call(0, {from: accounts[0]});
      assert.equal(senderNodeKey0.toString(), nodeKey.toString());
    });
    
    it("should have getNode return the same information that we sent when we created the Node", async () => {
      
      let node = await instance.getNode.call(nodeKey, {from: accounts[0]});
      let owner = node[0];
      let ipfs = node[1];
      let format = node[2];
      
      assert.equal(owner, accounts[0]);
      assert.equal(ipfs[0], hash0[0]);
      assert.equal(ipfs[1], hash0[1]);
      assert.equal(format, 42);
      
      // No comment on the halfEdgeKeys. See test_halfedges.js for that.
    });
  });
  
  contract("Creating a second Node with the same ipfs", async () => {
    let nodeKey0 = undefined;
    let nodeKey1 = undefined;
    
    before("create Node", async () => {
      // Grab the key of the new Node that will be created.
      nodeKey0 = await instance.keyFromIpfs.call(hash0, {from: accounts[0]});
      
      // Then actually run the function, which will create the Node with the key we just calculated.
      await instance.createNode(hash0, 42, {from: accounts[0]});
    });
    
    it("should give an error for the same owner, even if the format is different", async () => {
      
      await assert.requireEquals("A Node with _ipfs already exists!", async() => {
        await instance.createNode(hash0, 42, {from: accounts[0]});
      });
      
      await assert.requireEquals("A Node with _ipfs already exists!", async() => {
        await instance.createNode(hash0, 44, {from: accounts[0]});
      });
    });
    
    it("should give an error for a different owner, even if the format is different", async () => {
      
      await assert.requireEquals("A Node with _ipfs already exists!", async() => {
        await instance.createNode(hash0, 42, {from: accounts[1]});
      });
      
      await assert.requireEquals("A Node with _ipfs already exists!", async() => {
        await instance.createNode(hash0, 44, {from: accounts[1]});
      });
    });
  });
  
  contract("Creating 2 different Nodes for the same owner", async () => {
    let nodeKey0 = undefined;
    let nodeKey1 = undefined;
    
    before("create Nodes", async () => {
      // Grab the keys of the new Nodes that will be created.
      nodeKey0 = await instance.keyFromIpfs.call(hash0, {from: accounts[0]});
      nodeKey1 = await instance.keyFromIpfs.call(hash1, {from: accounts[0]});
      
      // Then actually run the function twice, which will create the Nodes with the keys we just calculated.
      await instance.createNode(hash0, 42, {from: accounts[0]});
      await instance.createNode(hash1, 44, {from: accounts[0]});
    });
    
    it("should have getSenderNodeCount give 2 as the number of sender Nodes after calling createNode twice", async () => {
      let numNodes = await instance.getSenderNodeCount.call({from: accounts[0]});
      assert.equal(numNodes, 2);
    });
    
    it("should have getSenderNodeKeyByIndex give the correct nodeKeys after calling createNode twice", async () => {
      let senderNodeKey0 = await instance.getSenderNodeKeyByIndex.call(0, {from: accounts[0]});
      let senderNodeKey1 = await instance.getSenderNodeKeyByIndex.call(1, {from: accounts[0]});
      assert.equal(senderNodeKey0.toString(), nodeKey0.toString());
      assert.equal(senderNodeKey1.toString(), nodeKey1.toString());
    });
    
    it("should have getNode return the same information for each Node that we sent when we created them", async () => {
      
      let node = await instance.getNode.call(nodeKey0, {from: accounts[0]});
      let owner = node[0];
      let ipfs = node[1];
      let format = node[2];
      
      assert.equal(owner, accounts[0]);
      assert.equal(ipfs[0], hash0[0]);
      assert.equal(ipfs[1], hash0[1]);
      assert.equal(format, 42);
      
      node = await instance.getNode.call(nodeKey1, {from: accounts[0]});
      owner = node[0];
      ipfs = node[1];
      format = node[2];
      
      assert.equal(owner, accounts[0]);
      assert.equal(ipfs[0], hash1[0]);
      assert.equal(ipfs[1], hash1[1]);
      assert.equal(format, 44);
      
      // No comment on the halfEdgeKeys. See test_halfedges.js for that.
    });
  });
  
  contract("Creating 2 different Nodes with different owners", async () => {
    let nodeKey0 = undefined;
    let nodeKey1 = undefined;
    
    before("create Nodes", async () => {
      nodeKey0 = await instance.keyFromIpfs.call(hash0, {from: accounts[0]});
      nodeKey1 = await instance.keyFromIpfs.call(hash1, {from: accounts[1]});
      
      await instance.createNode(hash0, 42, {from: accounts[0]});
      await instance.createNode(hash1, 44, {from: accounts[1]});
    });
    
    it("should have getSenderNodeCount give 1 as the number of sender Nodes for each owner", async () => {
      let numNodes0 = await instance.getSenderNodeCount.call({from: accounts[0]});
      let numNodes1 = await instance.getSenderNodeCount.call({from: accounts[1]});
      assert.equal(numNodes0, 1);
      assert.equal(numNodes1, 1);
    });
    
    it("should have getSenderNodeKeyByIndex give the correct nodeKeys at 0 for each owner", async () => {
      let senderNodeKey0 = await instance.getSenderNodeKeyByIndex.call(0, {from: accounts[0]});
      let senderNodeKey1 = await instance.getSenderNodeKeyByIndex.call(0, {from: accounts[1]});
      assert.equal(senderNodeKey0.toString(), nodeKey0.toString());
      assert.equal(senderNodeKey1.toString(), nodeKey1.toString());
    });
    
    it("should have getNode return the same information for each Node that we sent when we created them", async () => {
      
      let node = await instance.getNode.call(nodeKey0, {from: accounts[0]});
      let owner = node[0];
      let ipfs = node[1];
      let format = node[2];
      
      assert.equal(owner, accounts[0]);
      assert.equal(ipfs[0], hash0[0]);
      assert.equal(ipfs[1], hash0[1]);
      assert.equal(format, 42);
      
      node = await instance.getNode.call(nodeKey1, {from: accounts[1]});
      owner = node[0];
      ipfs = node[1];
      format = node[2];
      
      assert.equal(owner, accounts[1])
      assert.equal(ipfs[0], hash1[0]);
      assert.equal(ipfs[1], hash1[1]);
      assert.equal(format, 44);
      
      // No comment on the halfEdgeKeys. See test_halfedges.js for that.
    });
  });
  
  contract("Deleting Nodes you don't own", async () => {
    let nodeKey0 = undefined;
    let nodeKey1 = undefined;
    
    before("create Node", async () => {
      // Grab the keys of the new Nodes that could be created.
      nodeKey0 = await instance.keyFromIpfs.call(hash0, {from: accounts[0]});
      nodeKey1 = await instance.keyFromIpfs.call(hash1, {from: accounts[1]});
      
      // Then actually run the function just once, for the account[1] one.
      await instance.createNode(hash1, 44, {from: accounts[1]});
    });
    
    it("should give an error when you try to delete a non-existant Node", async () => {
      await assert.requireEquals("You must own this Node to be able to delete it.", async () => {
        await instance.deleteNode(nodeKey0, {from: accounts[0]});
      });
    });
    
    it("should give an error when you try to delete a Node at key 0", async () => {
      await assert.requireEquals("You must own this Node to be able to delete it.", async () => {
        await instance.deleteNode(emptyKey, {from: accounts[0]});
      });
    });
    
    it("should give an error when you try to delete someone else's Node", async () => {
      await assert.requireEquals("You must own this Node to be able to delete it.", async () => {
        await instance.deleteNode(nodeKey1, {from: accounts[0]});
      });
    });
  });
  
  contract("Deleting 1 Node after creating it", async () => {
    let nodeKey = undefined;
    
    before("create and delete Node", async () => {
      // Same pattern as above: grab keys from the pure keyFromIpfs function, and then create the Node (at that key).
      nodeKey = await instance.keyFromIpfs.call(hash0, {from: accounts[0]});
      await instance.createNode(hash0, 44, {from: accounts[0]});
      await instance.deleteNode(nodeKey, {from: accounts[0]})
    });
    
    it("should have getSenderNodeCount give 0 as the number of sender Nodes", async () => {
      let count = await instance.getSenderNodeCount.call({from: accounts[0]});
      assert.equal(count, 0);
    });
    
    it("should have getSenderNodeKeyByIndex give an error for the Node at index 0", async () => {
      await assert.requireEquals("The index supplied was >= the number of the Nodes belonging to the Owner.", async () => {
        await instance.getSenderNodeKeyByIndex.call(0, {from: accounts[0]});
      });
    });
    
    it("should have getNode return an error when called for the key of the deleted Node", async () => {
      await assert.requireEquals("Node does not exist.", async () => {
        await instance.getNode.call(nodeKey, {from: accounts[0]});
      });
    });
  });
  
  contract("Recreating your deleted Node", async () => {
    let nodeKey = undefined;
    
    before("create and delete Node", async () => {
      nodeKey = await instance.keyFromIpfs.call(hash0, {from: accounts[0]});
      await instance.createNode(hash0, 44, {from: accounts[0]});
      await instance.deleteNode(nodeKey, {from: accounts[0]})
    });
    
    it("should not give any errors when recreating the same Node after deleting it", async () => {
      await instance.createNode(hash0, 44, {from: accounts[0]});
      // No errors = pass.
    });
  });
  
  contract("Recreating someone else's deleted Node", async () => {
    let nodeKey = undefined;
    
    before("create and delete Node", async () => {
      nodeKey = await instance.keyFromIpfs.call(hash0, {from: accounts[0]});
      await instance.createNode(hash0, 44, {from: accounts[0]});
      await instance.deleteNode(nodeKey, {from: accounts[0]})
    });
    
    it("should not give any errors when recreating the same Node after deleting it", async () => {
      await instance.createNode(hash0, 44, {from: accounts[1]});
      // No errors = pass.
    });
  });
  
  contract("Creating and deleting 3 Nodes with the same account", async () => {
    let nodeKey0 = undefined;
    let nodeKey1 = undefined;
    let nodeKey2 = undefined;
    
    before("create the 3 Nodes", async () => {
      nodeKey0 = await instance.keyFromIpfs.call(hash0, {from: accounts[0]});
      nodeKey1 = await instance.keyFromIpfs.call(hash1, {from: accounts[0]});
      nodeKey2 = await instance.keyFromIpfs.call(hash2, {from: accounts[0]});
      await instance.createNode(hash0, 42, {from: accounts[0]});
      await instance.createNode(hash1, 42, {from: accounts[0]});
      await instance.createNode(hash2, 42, {from: accounts[0]});
    });
    
    it("should allow deleting the 3 Nodes, giving correct information at each point during the process", async () => {
      
      // Make sure count starts at 3.
      let count = await instance.getSenderNodeCount.call({from: accounts[0]});
      assert.equal(count, 3);
      
      // Delete the first Node, in this case, from the beginning of the list (0).
      await instance.deleteNode(nodeKey0, {from: accounts[0]});
      
      // Make sure count decreases to 2.
      count = await instance.getSenderNodeCount.call({from: accounts[0]});
      assert.equal(count, 2);
      
      // Make sure the remaining nodeKeys belonging to the sender are still there (the order doesn't matter).
      let nodeKeyAt0 = await instance.getSenderNodeKeyByIndex(0, {from: accounts[0]});
      let nodeKeyAt1 = await instance.getSenderNodeKeyByIndex(1, {from: accounts[0]});
      assert.equal([nodeKey1.toString(), nodeKey2.toString()].includes(nodeKeyAt0.toString()), true);
      assert.equal([nodeKey1.toString(), nodeKey2.toString()].includes(nodeKeyAt1.toString()), true);
      assert.notEqual(nodeKeyAt0.toString(), nodeKeyAt1.toString());
      
      // Make sure we can't get the sender's Node at index 2 any more.
      assert.requireEquals("The index supplied was >= the number of the Nodes belonging to the Owner.", async () => {
        await instance.getSenderNodeKeyByIndex(2, {from: accounts[0]});
      });
      
      // Delete another Node, this time from the end (2).
      await instance.deleteNode(nodeKey2, {from: accounts[0]});
      
      // Make sure count decreases to 1.
      count = await instance.getSenderNodeCount.call({from: accounts[0]});
      assert.equal(count, 1);
      
      // Make sure the remaining nodeKey (1) is now at index 0.
      nodeKeyAt0 = await instance.getSenderNodeKeyByIndex(0, {from: accounts[0]});
      assert.equal(nodeKeyAt0.toString(), nodeKey1.toString());
      
      // Make sure we can't get the sender's Node at index 1 any more.
      assert.requireEquals("The index supplied was >= the number of the Nodes belonging to the Owner.", async () => {
        await instance.getSenderNodeKeyByIndex(1, {from: accounts[0]});
      });
      
      // Delete the last Node (1).
      await instance.deleteNode(nodeKey1, {from: accounts[0]});
      
      // Make sure count decreases to 0.
      count = await instance.getSenderNodeCount.call({from: accounts[0]});
      assert.equal(count, 0);
      
      // Make sure we can't get the sender's Node at index 0 any more.
      assert.requireEquals("The index supplied was >= the number of the Nodes belonging to the Owner.", async () => {
        await instance.getSenderNodeKeyByIndex(0, {from: accounts[0]});
      });
      
    });
  });
  
  contract("Creating and deleting several Nodes with different accounts", async () => {
    let nodeKey0 = undefined;
    let nodeKey1 = undefined;
    let nodeKey2 = undefined;
    
    before("create the 3 Nodes", async () => {
      nodeKey0 = await instance.keyFromIpfs.call(hash0, {from: accounts[0]});
      nodeKey1 = await instance.keyFromIpfs.call(hash1, {from: accounts[0]});
      nodeKey2 = await instance.keyFromIpfs.call(hash2, {from: accounts[0]});
      
      // Wee, random sequence of (sometimes only attempted) creates and deletes.
      
      // 1) a0 owns n0
      await instance.createNode(hash0, 42, {from: accounts[0]});
      
      // 2) a1 owns n1
      await instance.createNode(hash1, 41, {from: accounts[1]});
      
      // 3) rejected
      try {
        await instance.createNode(hash1, 25, {from: accounts[0]});
      }
      catch (err) { }
      
      // 4) a0 owns n0, n2
      await instance.createNode(hash2, 12, {from: accounts[0]});
      
      // 5) rejected
      try {
        await instance.createNode(hash2, 98, {from: accounts[1]});
      }
      catch (err) { }
      
      // 6) a0 owns n2
      await instance.deleteNode(nodeKey0, {from: accounts[0]});
      
      // 7) a1 owns n1, n0 (a1 sniped deleted n0)
      await instance.createNode(hash0, 2, {from: accounts[1]});
      
      // 8) rejected
      try {
        await instance.deleteNode(nodeKey1, {from: accounts[0]});
      }
      catch (err) { }
      
      // 9) a0 owns nothing
      await instance.deleteNode(nodeKey2, {from: accounts[0]});
      
      // 10) a1 owns n1, n0, n2
      await instance.createNode(hash2, 56, {from: accounts[1]});
      
      // 11) rejected
      try {
        await instance.deleteNode(nodeKey0, {from: accounts[0]});
      }
      catch (err) { }
      
      // 12) a1 owns n0, n2
      await instance.deleteNode(nodeKey1, {from: accounts[1]});
      
      // 13) a0 owns n1 (a0 sniped deleted n1)
      await instance.createNode(hash1, 94, {from: accounts[0]});
      
      // Final state: a0 owns n1, a1 owns n0, n2
    });
    
    it("should have the correct owner Node counts at the end", async () => {
      
      let count0 = await instance.getSenderNodeCount.call({from: accounts[0]});
      let count1 = await instance.getSenderNodeCount.call({from: accounts[1]});
      assert.equal(count0, 1);
      assert.equal(count1, 2);
    });
    
    it("should have the correct owner Node keys at the end", async () => {
      
      let owner0key0 = await instance.getSenderNodeKeyByIndex.call(0, {from: accounts[0]});
      assert.requireEquals("The index supplied was >= the number of the Nodes belonging to the Owner.", async () => {
        let owner0key1 = await instance.getSenderNodeKeyByIndex.call(1, {from: accounts[0]});
      });
      let owner1key0 = await instance.getSenderNodeKeyByIndex.call(0, {from: accounts[1]});
      let owner1key1 = await instance.getSenderNodeKeyByIndex.call(1, {from: accounts[1]});
      assert.requireEquals("The index supplied was >= the number of the Nodes belonging to the Owner.", async () => {
        let owner1addr2 = await instance.getSenderNodeKeyByIndex.call(2, {from: accounts[1]});
      });
      
      // a0 owns n1
      assert.equal(owner0key0.toString(), nodeKey1.toString());
      
      // a1 owns n0, n2
      assert.equal([nodeKey0.toString(), nodeKey2.toString()].includes(owner1key0.toString()), true);
      assert.equal([nodeKey0.toString(), nodeKey2.toString()].includes(owner1key1.toString()), true);
      assert.notEqual(owner1key0.toString(), owner1key1.toString());
    });
    
    it("should have the correct Node data at the end", async () => {
      let node0 = await instance.getNode.call(nodeKey0, {from: accounts[0]});
      let node1 = await instance.getNode.call(nodeKey1, {from: accounts[0]});
      let node2 = await instance.getNode.call(nodeKey2, {from: accounts[0]});
      
      let owner0 = node0[0];
      let ipfs0 = node0[1];
      let format0 = node0[2];
      
      let owner1 = node1[0];
      let ipfs1 = node1[1];
      let format1 = node1[2];
      
      let owner2 = node2[0];
      let ipfs2 = node2[1];
      let format2 = node2[2];
      
      // a0 owns n1, a1 owns n0, n2
      assert.equal(owner0, accounts[1]);
      assert.equal(owner1, accounts[0]);
      assert.equal(owner2, accounts[1]);
      
      // Make sure our ipfs hashes survived
      assert.equal(ipfs0[0], hash0[0]);
      assert.equal(ipfs0[1], hash0[1]);
      assert.equal(ipfs1[0], hash1[0]);
      assert.equal(ipfs1[1], hash1[1]);
      assert.equal(ipfs2[0], hash2[0]);
      assert.equal(ipfs2[1], hash2[1]);
      
      // Make sure our formats survived
      assert.equal(format0, 2);
      assert.equal(format1, 94);
      assert.equal(format2, 56);
    })
  });
});
