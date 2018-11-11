# Interweaver's to-do items, 2018-10-22:

- [X] Register social accounts for interweavenetwork/interweaver, just in case...
  - [X] Twitter
    - Lol, no way to get either of those (size limit for the first one, already taken for the second one)
    - Oh well, got closest approximation, plus personal account.
  - [X] Medium
    - Only seems to be by email address, huh.
  - [ ] gmail?
    - they require a phone number now...
  - [X] github
    - kay.
    
- Thoughts on faster build-out of your own network:
  - Currently, you have to, to create a simple connected two-Node network:
    - Create a Node
    - Create a HalfEdge on it
    - Create another Node
    - Create a HalfEdge on it
    - (soon) Create an EdgeProposal linking those HalfEdges
    - (soon) Accept the EdgeProposal to finally connect the HalfEdges.
  - What if we had a fast-create function?
    - createEdgeAndNode(startNodeKey, halfEdge0Ipfs, halfEdge1Ipfs, newNodeIpfs, newNodeFormat)
      - Calls createHalfEdge for startNodeKey, halfEdge0Ipfs (this verifies you own startNodeKey and it can get more HalfEdges)
      - Calls createNode for newNodeIpfs/newNodeFormat
      - Calls createHalfEdge for newNodeKey, halfEdge1Ipfs
      - Then sets the otherHalfEdgeKey of each new HalfEdge to the other.
    - This would automatically build the two HalfEdges (starting from startNodeKey) and the new Node, with all the provided IPFSes.
    - Thus, the overall steps for a two-Node network:
      - Create your first Node (createNode(ipfs, format))
      - Create the second Node and HalfEdges: createEdgeAndNode(...)
      - Boom, done.
    - This makes total sense. Especially, avoiding the whole EdgeProposal situation when you already own the Node.
  - You might also just want to connect two Nodes you already have, but which don't have HalfEdges.
  - Suggests a createEdge(startNodeKey, halfEdge0Ipfs, halfEdge1Ipfs, endNodeKey)
  - Finally, what if you want to connect two Nodes you own that already half HalfEdges?
  - Well, createEdgeProposal would be the usual route, but that takes multiple steps.
  - Probably there should just be "toggleEdge" function.
  - This would make sure you own two HalfEdges, that they are either connected to each other or both to nothing, and then connect/disconnect them.
  
  - So proposed new functions (sigh):
    - toggleEdge(halfEdgeKey0, halfEdgeKey1),
      - verify HalfEdges are both owned by sender
      - If both connected to each other, set their otherHalfEdgeKeys to 0
      - Else if both connected to 0, set their otherHalfEdgeKeys to each other
      - Else error
    - createEdge(nodeKey0, ipfs0, ipfs1, nodeKey1),
      - createHalfEdge(nodeKey0, ipfs0)
      - createHalfEdge(nodeKey1, ipfs1)
      - directly connect halfEdges (toggleEdge checks are unneeded)
    - createEdgeAndNode(nodeKey0, halfEdgeIpfs0, halfEdgeIpfs1, nodeIpfs, nodeFormat)
      - createHalfEdge(nodeKey0, halfEdgeIpfs0)
      - createNode(nodeIpfs, nodeFormat)
      - createHalfEdge(newNodeKey, halfEdgeIpfs1)
      - directly connect halfEdges (toggleEdge checks are unneeded)
  - What about deleting?
    - I think toggleEdge (to avoid edgeProposals), plus standard deleteHalfEdge and deleteNode, should be fine here, since deleteNode deletes disconnected HalfEdges.
  - When should these be added?
    - Later! The network will function as is, just a bit less efficiently. Write unit tests and implement EdgeProposals, then come back to do these.
   
- [ ] Build Version 1 (the "free version", i.e. without any way to exchange money) of the Interweave Network.
  - [ ] Smart contracts
    - [ ] Write unit tests for InterweaveGraph:
      - [ ] test_halfedges.js:
        - [ ] createHalfEdge
        - [ ] deleteHalfEdge
        - [ ] getNode if that Node has HalfEdges
        - [ ] getEdge
        - [ ] deleteNode if that Node has HalfEdges
    - [ ] Fix any bugs with InterweaveGraph this turns up
    - [ ] Write unit tests for InterweaveProposals (at least, an attempt at them, given none of them will pass yet)
      - [ ] test_proposals.js:
        - [ ] createEdgeProposal
        - [ ] acceptEdgeProposal
        - [ ] rejectEdgeProposal
        - [ ] deleteNode if that Node's HalfEdges have EdgeProposals
        - [ ] deleteHalfEdge if that HalfEdge has EdgeProposals
    - [ ] Finish InterweaveProposals
    - [ ] Run tests as we go, and fix bugs with the contract and with the tests
    - [ ] With tested InterweaveGraph and InterweaveProposals contracts, compile and deploy to testnet!
    - [ ] Share somewhere, and fix bugs that people find, haha. This being the "free version", less (but not nothing) is at stake.
    - [ ] When DApp is tested and ready to go, deploy to mainnet!
  - [ ] DApp
    - [ ] Clone Set Hash code to start with
    - [ ] Rewrite the ContractHandler to interface with all of the smart contract functions
    - [ ] Spend a little time designing how the UI should look/be structured
    - [ ] Rewrite the Vue app to use the ContractHandler functions to implement this UI
    - [ ] Extensively test! Probably can point the ContractHandler at my Ganache testnet for cheaper tests before hitting up testnet.
    
- [ ] Build Version 2 (the "payable version", i.e. with the ability to pay/be paid for EdgeProposals, and Nodes are ERC-721s)

- [ ] Write whitepaper:
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
 



 
