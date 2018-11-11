# Interweaver's to-do items, 2018-10-18:
   

- [ ] Design the Interweave Network.
  - [ ] Rewrite interweave design documents into whitepaper-style document with more carefully-thought-out ideas.
    - [ ] Fill in sections. Note: leave out implementation details (anything as specific as which smart contracts or fields need to be created.) That goes in yellow paper.
      - [ ] Rationale for Interweave Network
      - [ ] Philosophy
      - [ ] Architecture
      - [ ] Applications
      - [ ] Challenges
      - [ ] Summary
      - [ ] Further Reading
    - [ ] Let sit for a few days while doing other things.
    - [ ] Revisions, round 1.
    - [ ] Let sit for another few days while doing other things.
    - [ ] Revisions, round 2.
    - [ ] Publish (reddit? medium? Lol, I've seen enough whitepapers to know where this is going. Not that I have any reach...)
 
- [ ] Learn how to do Remix unit testing.
  - You create a contract_test.sol file with a given format using 'Generate test file' in Remix.
  - Fill it with lots of Asserts.
  - There's an NPM module they have (remix-tests) that runs the test (for CI??)
  - Hmm, also maybe the tests can be run in Remix without the NPM module on hand?
  - Seems like it. The 'Run Tests' button doesn't work in Firefox though ('soljson is undefined' error.)
  - Does work in Chrome though!
  - You put a bunch of contracts called "test_1", "test_2", "arbitrary_name", etc. in the _test file. Seems it executes them in alphabetical order.
  - Each has "beforeAll" function that would seem to run before each check in the test. Instantiate tested contract there.
  - Then it has functions "check1", "check2", "arbitraryCamelCaseFunctionName" etc., which should contain lots of operations and Asserts. (prints test name un-camelcased)
  - Okay, seems simple enough!
  - Need to import your contract: import "./ContractName.sol";
  - Then instantiate it in beforeAll: ContractName varName = new ContractName();
  - Can use Solidity 0.4.25, rather than default 0.4.0.
  - Um, seems to be no way to set msg.sender??
  - Grr yes. It's not the account you picked in 'run', and it's not 0x0... No idea what it is, actually.
  - Okay, that's useless. Needed to be able to pick and set several different addresses, since msg.sender is called a lot in the contract functions.
  
- Thoughts on having an array ownerAddrs containing a list of all owner addresses in the graph?
  - You'd then have getCount and getOwnerAtIndex functions.
  - Owner would need to know its index in ownerAddrs in order to support deleting Owners (when they delete their last Node).
  - Together, this would let you iterate over all Nodes in the entire graph (by iterating over each Owner and each of their Nodes).
  - Without this, if you knew a given Owner, you could iterate over all their Nodes, and follow edges to other Nodes (with possible other Owners)
    - Basically you could do a graph exploration to try and get all the Nodes starting from a set of known ones.
    - However, you could always miss an Owner with Nodes that were disjoint from the main network.
  - With Events, you (a dapp) really can get a list of all created Nodes anyway... Or a list of all Owners, if you care for that.
  - The only real application I can see to this type of iteration is trying to visualize the entire graph.
  - You could still do that on large subsets of the graph via the graph exploration above, as long as you have a starting Node or Owner address.
  - The cost, in addition to complexity, of having ownerAddrs is that adding your first Node, or deleting your last one, has additional gas cost:
    - When creating your first Node, Pushing your address to ownerAddrs
    - When creating your first Node, Setting your address index in ownerAddrs in your Owner object (to support fast deletions)
    - Conmpacting ownerAddrs when you delete your last node and remove your address from ownerAddrs.
  - I kind of like the semi-anonymity of, as a new Node owner who isn't connected to the main network yet, not being lookable up (except by Events).
  - So yes, let's not have ownerAddrs.
  - People can look up Nodes and EdgeProposals by an Owner's address, if they know it (from checking a Node's Owner address, or because it's their own address.
  
  - Think of some tests for the Node creation/deletion situations:
    - Before doing anything:
      - getOwnerNodeCount(0) == 0
      - getOwnerNodeCount(msg.sender) == 0
      - getOwnerNodeAddrByIndex(0, 0) throws
      - getOwnerNodeAddrByIndex(msg.sender, 0) throws
      - getOwnerNodeAddrByIndex(msg.sender, 1) throws
    - Create a node with some msg.sender and ipfs hash !== 32
      - ...
  
- Work out how to create/delete HalfEdges:
  - To create, node's Owner calls createHalfEdge(_nodeAddr, _ipfs)
    - Require msg.sender == node.owner
    - require node.halfEdgeAddrs.length < 6
    - require ipfs valid
    - get newHalfEdgeAddr = kekkac(ipfs)
    - make newHalfEdge with _nodeAddr and _ipfs
    - set halfEdgeLookup[newHalfEdgeAddr] = newHalfEdge
    - Push newHalfEdgeAddr to node.halfEdgeAddrs
    - emit HalfEdgeCreated event
    - return newHalfEdgeAddr
  - To delete, Node's Owner calls deleteHalfEdge(_halfEdgeAddr)
    - get halfEdge = halfEdgeLookup[_halfEdgeAddr]
    - require halfEdge.nodeAddr != 0 (otherwise invalid halfEdgeAddr)
    - get node = nodeLookup[halfEdge.nodeAddr]
    - require node.owner == msg.sender (otherwise not your node)
    - require halfEdge.otherHalfEdgeAddr == 0 (otherwise connected, so can't delete)
    - delete halfEdgeLookup[_halfEdgeAddr]
    - Find _halfEdgeAddr in node.halfEdgeAddrs (iterate up to 6 times)
    - Compactify if needed, then delete last index of node.halfEdgeAddrs
    - emit HalfEdgeDeleted event
    
    
- Findings from Remix testing:
  - halfEdgeLookup returns HalfEdge nodeAddr, ipfs, and otherHalfEdgeAddr just fine.
  - nodeLookup returns the Node owner/ipfs/format/(ownerNodesIndex) for an address just fine...
  - BUT, it doesn't return halfEdgeAddrs at all! I guess that makes sense - you can't get arrays as return values, it seems.
  - Thus, going to need to make some functions to access:
    - getHalfEdgeCountForNodeAddr, getNodeHalfEdgeAddrByIndex
    - Also, don't really want ownerNodesIndex showing up in the return... But it doesn't really matter.
    - Could make nodeLookup private and have several functions for getting Node values...
    - More efficient to return the non-array values in a struct though, I think?
    - Leaves us needing those two functions to iterate the edges.
  - An ideal case would be, to make nodeLookup private, and make a function getNodeInfo(nodeAddr), which returns a FullNodeInfo struct:
    ```
    struct FullNodeInfo {
      address owner;
      string ipfs;
      uint32 format;
      uint8 numHalfEdges;
      string myHalf0ipfs;
      string otherHalf0ipfs;
      uint32 node0Format;
      address node0Addr;
      // last 4 variables 5 more times, being 0s if those edges don't exist...
    }
    ```
  - This would be a total of 7 addresses, 13 ipfs-length strings, 7 uint32s, one uint8. Pretty big, *but*, if this is a 'view' function, no real cost?
  - This would let you:
    - fully render the Node
    - Fully render all HalfEdges + opposite-pair HalfEdges
    - Find any connected Node addresses (ready to call same function on.)
    - all in one call on a Node address!
  - This would be the main graph-exploration function. You know your Node address, so look up the ipfs hashes to render, and what other Nodes are adjacent.
  - Then if you want to travel an edge, you can render it immediately while looking up the next node.
  - Unless there's something prohibitive about having a 28-value Struct and generating/returning it in a view function, this makes a lot of sense.
  - Then you could make nodeLookup private.
  - Couldn't make edgeLookup private because edgeProposalLookup refers to them...
  - Unless you also had a similar FullEdgeProposalInfo struct you could call a function to get from an EdgeProposal address?
  - These functions would take the "call lots of little functions tons of times" responsibility from the Viewer and reduce function calls,
  - ...but make the Solidity code more complex.
  - Hmm. Should probably think about this tradeoff more, since it may be that lots of very small, specific view function calls are ideal, versus few large, all-encompassing ones. ones.
  
  - Okay, some more research and Remix testing later...
    - You can't return a Struct as a result (although having a public mapping to one seems to be kosher.) without a future experimental ABI feature.
    - You *can* have multiple Return values, like return (address, address, ...).
    - However, the stack depth is only 16, so if you have more than 14 values (not sure what the other 2 are) in the return, it out-deeps the stack.
    - So: a 28-element return value is absolutely not possible at the moment.
    - So: having functions to count and iterate the Node halfEdgeAddrs is the way to go, even if it means that, to get the adjacent Node's ipfs hash:
      - Get Node's count
      - Get HalfEdge address at selected index
      - Look up the HalfEdge in halfEdgeLookup (get nodeAddr back to starting Node, ipfs, and otherHalfEdgeAddr)
      - Look up its otherHalfEdgeAddr in halfEdgeLookup (get nodeAdrr to other Node, ipfs, and otherHalfEdgeAddr back to first HalfEdge)
      - Look up its nodeAddr in nodeLookup (get Node owner, ipfs, format, ownerNodesIndex
      - Ie, 5 sequential view calls to the contract just to navigate a single edge between Nodes. Actually, that could be worse...
    - Well, you could reduce one step by having a getNodeHalfEdgeAddrs function that simply returns all the half edges with empty slots.
    
  
  - Other Remix findings: Manually testing with function calls in Remix is going to almost immediately become impossible to keep up with.
  - *must* learn a good unit-testing setup before getting much farther.
  
  - Tried to refactor single contract into one for Nodes, child one of Nodes for HalfEdges, child one of HalfEdges for EdgeProposals...
    - But this didn't work, mainly because Nodes partly depends on HalfEdges (especially deleting Nodes)
    - Deleting Nodes has a precondition of all your HalfEdges being disconnected, and a result of the HalfEdges being deleted from the halfEdgeLookup...
    - So, would have to override that deleteNode function in HalfEdges, and then call super.deleteNode, but duplicate some logic around it... Messy and more expensive.
    - It was nice having the code split like that otherwise though!
    - Maybe EdgeProposals can go into their own child contract just fine, leaving Nodes and HalfEdges together, perhaps in a Graph contract?
    - That would make more sense once EdgeProposals contains actual payment stuff, since that'll increase the contract size to comparable to the Graph stuff.
  
  
- [ ] Build Version 1 of the InterweaveGraph contract.
 
