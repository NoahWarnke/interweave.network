# Interweaver's to-do items, 2018-10-28:

- When MetaMask gets the stupid swirly of death...
  - Close and reopen Chrome
  - Before signing back in to MetaMask, change network to Rinkeby or something (away from RPC private network)
  - Sign in
  - Change back to RPC private network.
  
- Helpful functions that can be run in the console now that the handler js file has been created:

    Getting a nodeKey:
    let nodeKey = interweaveApp.InterweaveFreeHandler.nodeKeyFromIpfs("... ipfs hash")

    Creating a Node:
    interweaveApp.InterweaveFreeHandler.createNode("...ipfs hash",interweaveApp.account)

    Deleting a Node:
    interweaveApp.InterweaveFreeHandler.deleteNode("...nodeKey", interweaveApp.account)
    
    Getting a list of my Nodes:
    let myNodes = interweaveApp.InterweaveFreeHandler.getNodesBelongingTo(interweaveApp.account)

    Getting Node data:
    let node0 = interweaveApp.InterweaveFreeHandler.getNode("...nodeKey")

    Getting an edgeProposalKey:
    let edgeProposalKey = interweaveApp.InterweaveFreeHandler.edgeProposalKeyFromNodesAndSlots("...nodeKey0", "...nodeKey1", 0, 0)
    
    Creating an EdgeProposal:
    interweaveApp.InterweaveFreeHandler.createEdgeProposal("...nodeKey0", "...nodeKey1", 0, 0, "message", interweaveApp.account)
    
    Accepting an EdgeProposal:
    interweaveApp.InterweaveFreeHandler.acceptEdgeProposal("...edgeProposalKey", interweaveApp.account)
    
    Rejecting an EdgeProposal:
    interweaveApp.InterweaveFreeHandler.rejectEdgeProposal("...edgeProposalKey", interweaveApp.account)
  
    Getting a list of my EdgeProposals:
    let myEdgeProposals = interweaveApp.InterweaveFreeHandler.getEdgeProposalsBelongingTo(interweaveApp.account)
  
- [ ] Build Version 1 (the "free version", i.e. without any way to exchange money) of the Interweave Network.
  - [ ] DApp
    - [X] Clone Set Hash code to Interweave Free to start with
    - [X] Strip it down.
    - [X] Rewrite the InterweaveFreeContract handler to interface with all of the smart contract functions
      - [X] Put in contract address and ABI
        - Actually a little hard to get ABI, because you have to include imported contracts in the solcjs call:
          - solcjs --abi InterweaveProposals.sol InterweaveGraph.sol
      - [X] InterweaveGraph
        - [X] nodeKeyFromIpfs
        - [X] createNode
        - [X] deleteNode
        - [X] getNode
        - [X] Get your list of Nodes via NodeCreated and NodeDeleted events.
      - [X] InterweaveProposals
        - [X] edgeProposalKeyFromNodesAndSlots
        - [X] createEdgeProposal
        - [X] acceptEdgeProposal
        - [X] rejectEdgeProposal
        - [X] getEdgeProposal
        - [X] Get your list of current EdgeProposals via EdgeProposalCreated, EdgeProposalAccepted, EdgeProposalRejected events.
    - [ ] Design how the dApp UI should look/be structured (leaving out the format module - just "render" ipfs as a text box with the ipfs file contents in it, the default "I can't parse this" format.)
    - [ ] Rewrite the Vue app to use the InterweaveFreeContract handler functions to implement this UI
    - [ ] Design how formods should interface with the dApp on a technical level, enabling both exploration and file-generation for that format.
    - [ ] Design how the first formod (exploration:text) should look
    - [ ] Implement the formod!
    - [ ] Extensively test!
    - [ ] Share somewhere, and fix bugs that people find, haha. This being the "free version", less (but not nothing) is at stake.
  - [ ] Smart contracts
    - [ ] When DApp is ready to share, compile and deploy to testnet!
    - [ ] When DApp is tested and ready to go, deploy to mainnet!
    
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
 



 
