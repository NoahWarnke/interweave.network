# Interweaver's to-do items, 2018-11-05:

- Creating a node now:
  - interweaveApp.$children[0].contract.createNode("...ipfs", interweaveApp.$children[0].web3Handler.account)
- Getting nodes:
  - interweaveApp.$children[0].contract.getNodesBelongingTo(interweaveApp.$children[0].web3Handler.account)

- [ ] Create a simple network of test Nodes on Rinkeby so I can test the dapp better (MetaMask + Ganache = totally impossible to use...)
  - [ ] Write simple versions of those Nodes
    - [X] Intereweave Grotto v2
      - Ipfs: QmWSEucjdTRcCbrx4FLTuNEAv6XrJrUVTzY1Lh9bFCoUfV
      - Node: 4802423149786398712975601635277375780486398097217997509586637249159306333648
  - [ ] Create and connect them (at least 2 accounts)
  - [ ] Make sure there are some NodeProposals floating around.
  
- [ ] Build Version 1 (the "free version", i.e. without any way to exchange money) of the Interweave Network.
  - [ ] DApp
    - [ ] Write the Vue app
      - [ ] Formod1 explore mode
        - [ ] Make sure clicking the default edge buttons along the top puts in the correct slot for the format module
        - [X] Update format to new design, and upload test nodes for that (don't need to delete old ones!)
      - [ ] Build mode
        - [ ] Formod1 build mode (triggered by 'add node' button and then picking formod1 in the dropdown)
      - [ ] My Nodes
      - [ ] My Edge Proposals
      - [ ] Edge Proposal
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
 



 
