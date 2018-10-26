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
    
    it("should give an error when you try to access a Node at key 0", async () => {
      assert.requireEquals("Node does not exist.", async () => {
        let node = await instance.getNode.call(emptyKey, {from: accounts[0]});
      });
    });
  });
  
  contract("Creating 1 Node with invalid (all 0s) ipfs hash", async () => {
    
    it("Should give an error", async () => {
      await assert.requireEquals("_ipfs[0] was empty!", async() => {
        await instance.createNode(emptyHash, {from: accounts[0]});
      });
    });
  });
  
  contract("Creating 1 Node", async () => {
    let nodeKey = undefined;
    let tx = undefined;
    
    before("create Node", async () => {
      // Grab the key of the new Node that will be created.
      nodeKey = await instance.nodeKeyFromIpfs.call(hash0, {from: accounts[0]});
      
      // Then actually run the function, which will create the node with the key we just calculated.
      tx = await instance.createNode(hash0, {from: accounts[0]});
    });
    
    it("should have getNode return the same information that we sent when we created the Node", async () => {
      
      let node = await instance.getNode.call(nodeKey, {from: accounts[0]});
      let owner = node[0];
      let ipfs = node[1];
      
      assert.equal(owner, accounts[0]);
      assert.equal(ipfs[0], hash0[0]);
      assert.equal(ipfs[1], hash0[1]);
      
      // No comment on the halfEdgeKeys. See test_edgeproposals.js for that.
    });
    
    it("should have logged a NodeCreated event with the correct data", async () => {
      
      assert.eventHappenedOnce(tx, "NodeCreated", {
        nodeKey: nodeKey,
        ownerAddr: accounts[0]
      });
      
    });
  });
  
  contract("Creating a second Node with the same ipfs", async () => {
    let nodeKey0 = undefined;
    let nodeKey1 = undefined;
    
    before("create Node", async () => {
      // Grab the key of the new Node that will be created.
      nodeKey0 = await instance.nodeKeyFromIpfs.call(hash0, {from: accounts[0]});
      
      // Then actually run the function, which will create the Node with the key we just calculated.
      await instance.createNode(hash0,{from: accounts[0]});
    });
    
    it("should give an error for the same owner", async () => {
      
      await assert.requireEquals("A Node with _ipfs already exists!", async() => {
        await instance.createNode(hash0, {from: accounts[0]});
      });
      
      await assert.requireEquals("A Node with _ipfs already exists!", async() => {
        await instance.createNode(hash0, {from: accounts[0]});
      });
    });
    
    it("should give an error for a different owner", async () => {
      
      await assert.requireEquals("A Node with _ipfs already exists!", async() => {
        await instance.createNode(hash0, {from: accounts[1]});
      });
      
      await assert.requireEquals("A Node with _ipfs already exists!", async() => {
        await instance.createNode(hash0, {from: accounts[1]});
      });
    });
  });
  
  contract("Creating 2 different Nodes for the same owner", async () => {
    let nodeKey0 = undefined;
    let nodeKey1 = undefined;
    let tx0 = undefined;
    let tx1 = undefined;
    
    before("create Nodes", async () => {
      // Grab the keys of the new Nodes that will be created.
      nodeKey0 = await instance.nodeKeyFromIpfs.call(hash0, {from: accounts[0]});
      nodeKey1 = await instance.nodeKeyFromIpfs.call(hash1, {from: accounts[0]});
      
      // Then actually run the function twice, which will create the Nodes with the keys we just calculated.
      tx0 = await instance.createNode(hash0, {from: accounts[0]});
      tx1 = await instance.createNode(hash1, {from: accounts[0]});
    });
    
    it("should have getNode return the same information for each Node that we sent when we created them", async () => {
      
      let node = await instance.getNode.call(nodeKey0, {from: accounts[0]});
      let owner = node[0];
      let ipfs = node[1];
      
      assert.equal(owner, accounts[0]);
      assert.equal(ipfs[0], hash0[0]);
      assert.equal(ipfs[1], hash0[1]);
      
      node = await instance.getNode.call(nodeKey1, {from: accounts[0]});
      assert.equal(node[0], accounts[0]);
      assert.equal(node[1][0], hash1[0]);
      assert.equal(node[1][1], hash1[1]);
      
      // No comment on the halfEdgeKeys. See test_halfedges.js for that.
    });
    
    it("should have fired a NodeCreated event for each Node", async () => {
      assert.eventHappenedOnce(tx0, "NodeCreated", {
        nodeKey: nodeKey0,
        ownerAddr: accounts[0]
      });
    
      assert.eventHappenedOnce(tx1, "NodeCreated", {
        nodeKey: nodeKey1,
        ownerAddr: accounts[0]
      });
    });
  });
  
  contract("Creating 2 different Nodes with different owners", async () => {
    let nodeKey0 = undefined;
    let nodeKey1 = undefined;
    let tx0 = undefined;
    let tx1 = undefined;
    
    before("create Nodes", async () => {
      nodeKey0 = await instance.nodeKeyFromIpfs.call(hash0, {from: accounts[0]});
      nodeKey1 = await instance.nodeKeyFromIpfs.call(hash1, {from: accounts[1]});
      
      tx0 = await instance.createNode(hash0, {from: accounts[0]});
      tx1 = await instance.createNode(hash1, {from: accounts[1]});
    });
    
    it("should have getNode return the same information for each Node that we sent when we created them", async () => {
      
      let node = await instance.getNode.call(nodeKey0, {from: accounts[0]});
      let owner = node[0];
      let ipfs = node[1];
      
      assert.equal(owner, accounts[0]);
      assert.equal(ipfs[0], hash0[0]);
      assert.equal(ipfs[1], hash0[1]);
      
      node = await instance.getNode.call(nodeKey1, {from: accounts[1]});
      owner = node[0];
      ipfs = node[1];
      
      assert.equal(owner, accounts[1])
      assert.equal(ipfs[0], hash1[0]);
      assert.equal(ipfs[1], hash1[1]);
      
      // No comment on the halfEdgeKeys. See test_halfedges.js for that.
    });
    
    it("should have fired a NodeCreated event for each Node", async () => {
      assert.eventHappenedOnce(tx0, "NodeCreated", {
        nodeKey: nodeKey0,
        ownerAddr: accounts[0]
      });
    
      assert.eventHappenedOnce(tx1, "NodeCreated", {
        nodeKey: nodeKey1,
        ownerAddr: accounts[1]
      });
    });
    
  });
  
  contract("Deleting Nodes you don't own", async () => {
    let nodeKey0 = undefined;
    let nodeKey1 = undefined;
    
    before("create Node", async () => {
      // Grab the keys of the new Nodes that could be created.
      nodeKey0 = await instance.nodeKeyFromIpfs.call(hash0, {from: accounts[0]});
      nodeKey1 = await instance.nodeKeyFromIpfs.call(hash1, {from: accounts[1]});
      
      // Then actually run the function just once, for the account[1] one.
      await instance.createNode(hash1, {from: accounts[1]});
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
    let tx = undefined;
    
    before("create and delete Node", async () => {
      // Same pattern as above: grab keys from the pure nodeKeyFromIpfs function, and then create the Node (at that key).
      nodeKey = await instance.nodeKeyFromIpfs.call(hash0, {from: accounts[0]});
      await instance.createNode(hash0, {from: accounts[0]});
      tx = await instance.deleteNode(nodeKey, {from: accounts[0]})
    });
    
    it("should have getNode return an error when called for the key of the deleted Node", async () => {
      await assert.requireEquals("Node does not exist.", async () => {
        await instance.getNode.call(nodeKey, {from: accounts[0]});
      });
    });
    
    it("should have fired a NodeDeleted event with the correct information", async () => {
      assert.eventHappenedOnce(tx, "NodeDeleted", {
        nodeKey: nodeKey,
        ownerAddr: accounts[0]
      });
    });
  });
  
  contract("Recreating your deleted Node", async () => {
    let nodeKey = undefined;
    let tx = undefined;
    
    before("create and delete Node", async () => {
      nodeKey = await instance.nodeKeyFromIpfs.call(hash0, {from: accounts[0]});
      await instance.createNode(hash0, {from: accounts[0]});
      await instance.deleteNode(nodeKey, {from: accounts[0]});
      tx = await instance.createNode(hash0, {from: accounts[0]});
    });
    
    it("should have fired a NodeCreated event with the correct information", async () => {
      assert.eventHappenedOnce(tx, "NodeCreated", {
        nodeKey: nodeKey,
        ownerAddr: accounts[0]
      });
    });
  });
  
  contract("Recreating someone else's deleted Node", async () => {
    let nodeKey = undefined;
    let tx = undefined;
    
    before("create and delete Node", async () => {
      nodeKey = await instance.nodeKeyFromIpfs.call(hash0, {from: accounts[0]});
      await instance.createNode(hash0, {from: accounts[0]});
      await instance.deleteNode(nodeKey, {from: accounts[0]})
      tx = await instance.createNode(hash0, {from: accounts[1]});
    });
    
    it("should have fired a NodeCreated event with the correct information", async () => {
      assert.eventHappenedOnce(tx, "NodeCreated", {
        nodeKey: nodeKey,
        ownerAddr: accounts[1]
      });
    });
  });
  
  contract("Creating and deleting 3 Nodes with the same account", async () => {
    let nodeKey0 = undefined;
    let nodeKey1 = undefined;
    let nodeKey2 = undefined;
    
    let tx0 = undefined;
    let tx1 = undefined;
    let tx2 = undefined;
    
    before("create the 3 Nodes", async () => {
      nodeKey0 = await instance.nodeKeyFromIpfs.call(hash0, {from: accounts[0]});
      nodeKey1 = await instance.nodeKeyFromIpfs.call(hash1, {from: accounts[0]});
      nodeKey2 = await instance.nodeKeyFromIpfs.call(hash2, {from: accounts[0]});
      await instance.createNode(hash0, {from: accounts[0]});
      await instance.createNode(hash1, {from: accounts[0]});
      await instance.createNode(hash2, {from: accounts[0]});
    });
    
    it("should allow deleting the 3 Nodes, giving correct information and events at each point during the process", async () => {
      let node = await instance.getNode.call(nodeKey0, {from: accounts[0]});
      assert.equal(node[0], accounts[0]);
      assert.equal(node[1][0], hash0[0]);
      assert.equal(node[1][1], hash0[1]);
      
      node = await instance.getNode.call(nodeKey1, {from: accounts[0]});
      assert.equal(node[0], accounts[0]);
      assert.equal(node[1][0], hash1[0]);
      assert.equal(node[1][1], hash1[1]);
      
      node = await instance.getNode.call(nodeKey2, {from: accounts[0]});
      assert.equal(node[0], accounts[0]);
      assert.equal(node[1][0], hash2[0]);
      assert.equal(node[1][1], hash2[1]);
      
      
      // Delete the first Node, in this case, from the beginning of the list (0).
      tx0 = await instance.deleteNode(nodeKey0, {from: accounts[0]});
      
      await assert.requireEquals("Node does not exist.", async () => {
        await instance.getNode.call(nodeKey0, {from: accounts[0]});
      });
      
      node = await instance.getNode.call(nodeKey1, {from: accounts[0]});
      assert.equal(node[0], accounts[0]);
      assert.equal(node[1][0], hash1[0]);
      assert.equal(node[1][1], hash1[1]);
      
      node = await instance.getNode.call(nodeKey2, {from: accounts[0]});
      assert.equal(node[0], accounts[0]);
      assert.equal(node[1][0], hash2[0]);
      assert.equal(node[1][1], hash2[1]);
      
      assert.eventHappenedOnce(tx0, "NodeDeleted", {
        nodeKey: nodeKey0,
        ownerAddr: accounts[0]
      });
      
      // Delete another Node, this time from the end (2).
      tx1 = await instance.deleteNode(nodeKey2, {from: accounts[0]});
      
      await assert.requireEquals("Node does not exist.", async () => {
        await instance.getNode.call(nodeKey0, {from: accounts[0]});
      });
      
      node = await instance.getNode.call(nodeKey1, {from: accounts[0]});
      assert.equal(node[0], accounts[0]);
      assert.equal(node[1][0], hash1[0]);
      assert.equal(node[1][1], hash1[1]);
      
      await assert.requireEquals("Node does not exist.", async () => {
        await instance.getNode.call(nodeKey2, {from: accounts[0]});
      });
      
      assert.eventHappenedOnce(tx1, "NodeDeleted", {
        nodeKey: nodeKey2,
        ownerAddr: accounts[0]
      });
      
      // Delete the last Node (1).
      tx2 = await instance.deleteNode(nodeKey1, {from: accounts[0]});
      
      await assert.requireEquals("Node does not exist.", async () => {
        await instance.getNode.call(nodeKey0, {from: accounts[0]});
      });
      
      await assert.requireEquals("Node does not exist.", async () => {
        await instance.getNode.call(nodeKey1, {from: accounts[0]});
      });
      
      await assert.requireEquals("Node does not exist.", async () => {
        await instance.getNode.call(nodeKey2, {from: accounts[0]});
      });
      
      assert.eventHappenedOnce(tx2, "NodeDeleted", {
        nodeKey: nodeKey1,
        ownerAddr: accounts[0]
      });
      
    });
  });
  
  contract("Creating and deleting several Nodes with different accounts", async () => {
    let nodeKey0 = undefined;
    let nodeKey1 = undefined;
    let nodeKey2 = undefined;
    
    before("create the 3 Nodes", async () => {
      nodeKey0 = await instance.nodeKeyFromIpfs.call(hash0, {from: accounts[0]});
      nodeKey1 = await instance.nodeKeyFromIpfs.call(hash1, {from: accounts[0]});
      nodeKey2 = await instance.nodeKeyFromIpfs.call(hash2, {from: accounts[0]});
      
      // Wee, random sequence of (sometimes only attempted) creates and deletes.
      
      // 1) a0 owns n0
      await instance.createNode(hash0, {from: accounts[0]});
      
      // 2) a1 owns n1
      await instance.createNode(hash1, {from: accounts[1]});
      
      // 3) rejected
      try {
        await instance.createNode(hash1, {from: accounts[0]});
      }
      catch (err) { }
      
      // 4) a0 owns n0, n2
      await instance.createNode(hash2, {from: accounts[0]});
      
      // 5) rejected
      try {
        await instance.createNode(hash2, {from: accounts[1]});
      }
      catch (err) { }
      
      // 6) a0 owns n2
      await instance.deleteNode(nodeKey0, {from: accounts[0]});
      
      // 7) a1 owns n1, n0 (a1 sniped deleted n0)
      await instance.createNode(hash0, {from: accounts[1]});
      
      // 8) rejected
      try {
        await instance.deleteNode(nodeKey1, {from: accounts[0]});
      }
      catch (err) { }
      
      // 9) a0 owns nothing
      await instance.deleteNode(nodeKey2, {from: accounts[0]});
      
      // 10) a1 owns n1, n0, n2
      await instance.createNode(hash2, {from: accounts[1]});
      
      // 11) rejected
      try {
        await instance.deleteNode(nodeKey0, {from: accounts[0]});
      }
      catch (err) { }
      
      // 12) a1 owns n0, n2
      await instance.deleteNode(nodeKey1, {from: accounts[1]});
      
      // 13) a0 owns n1 (a0 sniped deleted n1)
      await instance.createNode(hash1, {from: accounts[0]});
      
      // Final state: a0 owns n1, a1 owns n0, n2
    });
    
    it("should have the correct Node data at the end", async () => {
      let node0 = await instance.getNode.call(nodeKey0, {from: accounts[0]});
      let node1 = await instance.getNode.call(nodeKey1, {from: accounts[0]});
      let node2 = await instance.getNode.call(nodeKey2, {from: accounts[0]});
      
      let owner0 = node0[0];
      let ipfs0 = node0[1];
      
      let owner1 = node1[0];
      let ipfs1 = node1[1];
      
      let owner2 = node2[0];
      let ipfs2 = node2[1];
      
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
    })
  });
});
