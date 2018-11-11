# Interweaver's to-do items, 2018-10-26:
  
- [ ] Build Version 1 (the "free version", i.e. without any way to exchange money) of the Interweave Network.
  - [ ] Smart contracts
    - [X] Finish InterweaveProposals (initial implementation)
    - [ ] Write unit tests for InterweaveProposals (at least, an attempt at them, given none of them will pass yet)
      - [ ] test_proposals.js:
        - [ ] createEdgeProposal
          - Should error if slot0 > 5
          - Should error if slot1 > 5
          - Should error if nodeKey0 not owned by msg.sender
          - Should error if nodeKey1 doesn't exist
          - Should error if node0[slot0] is a third node
          - Should error if node1[slot1] is a third node
          - Should error if the same EdgeProposal already exists.
          - Should error if the reverse EdgeProposal already exists.
          - Should result in connected Nodes and an EdgeCreated event if they're both msg.sender's and they were both 0 before
          - Should result in disconnected Nodes and an EdgeDeleted event if they're both msg.sender's and they were both each other before
          - Otherwise, should result in the correct getEdgeProposal values and an CdgeProposalCreated event.
          - Should not error if the same person makes another EdgeProposal pointing from the same Node slot to a different slot.
          - Should not error if the same person makes another EdgeProposal pointing to the same Node slot from a different slot.
        - [ ] acceptEdgeProposal
          - Should error if EdgeProposal doesn't exist
          - Should error if ep.n1.ownerAddr != msg.sender
          - Should error if EdgeProposal is invalid (due to slots already being taken)
          - Should disconnect if Nodes are currently connected and emit an EdgeDeleted event
          - Should connect if Nodes are currently disconnected and emit an EdgeCreated event
          - Should delete the EdgeProposal from the lookup
          - Should result in an EdgeProposalAccepted event with correct values
        - [ ] rejectEdgeProposal
          - Should error if EdgeProposal doesn't exist
          - Should error if neither ep.n0.ownerAddr nor ep.n1.ownerAddr is msg.sender
          - Should emit an EdgeProposalRejected event
          - Should result in getEdgeProposal on the deleted EdgeProposal erroring.
          - Subsequent createEdgeProposals along the same edge should succeed.
        - [ ] deleteNode if that Node has EdgeProposals
          - Should not error
          - getEdgeProposal should return an invalid EdgeProposal afterward.
        - [ ] deleteNode if that Node has 1-6 edgeNodeKeys values set to nonzero
          - Should give an error
        - [ ] getEdgeProposal
          - Should return correct EP data for several EdgeProposals
          - Should return valid for two Nodes connected to each other
          - Should return valid for two Nodes not connected to anything (on those slots)
          - Should return invalid for two Nodes where one or the other are pointed to a third Node
          - Should return connect=true if the two Nodes are not connected to anything
          - Should return connect=false otherwise
          

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
 



 
