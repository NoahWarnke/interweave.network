# Interweaver's to-do items, 2018-11-02:

- Thoughts on eventual changing of IPFS (I think it's probably necessary...)
  - Nodes are no longer keyed by IPFS hash, so that you can change it without changing the Node key. Maybe just by blocknumber, owner address hash? Also, allows Nodes with duplicate IPFSes - I'd prefer this not be the case, but oh well.
  - Each Node has a dateIpfsLastChanged field (starts at 0 when Node is created, so no creation cost)
  - If you change IPFS, this field gets set/updated.
  - When someone creates an EdgeProposal to your Node which would disconnect their Node from your Node, it checks this date - if it's within the past week or month or something, it immediately does the disconnect without creating an EdgeProposal, as if they owned your Node. This lets folks who don't like the new change to fairly back out, and incentivises not changing Node ipfses, but allows it if you really need to.
  
- Thoughts on a new way of creating Node keys:
  - The ownerNodeCount mapping (for Interweave Full) will have plenty of space for multiple counts. Maybe 4 uint64s?
  - Say first uint64 = how many Nodes they have currently, second uint64 = a nonce for how many Nodes they ever personally created. (any use for the other 2 uint64s?)
  - Then you could use keccak(ownerAddr, nonce) to generate Node addresses, and it would be both predictable and unique.
  - Updating this count would only be 5k gas for the two (or possibly four) values whenever Nodes are created/traded/deleted.

- [ ] Create a simple network of test Nodes on Rinkeby so I can test the dapp better (MetaMask + Ganache = totally impossible to use...)
  - [ ] Write simple versions of those Nodes
    - [ ]
  - [ ] Create and connect them (at least 2 accounts)
  - [ ] Make sure there are some NodeProposals floating around.
  

- [ ] Build Version 1 (the "free version", i.e. without any way to exchange money) of the Interweave Network.
  - [ ] DApp
    - [ ] Rewrite the Vue app to use the InterweaveFreeContract handler functions to implement this UI
      - [ ] Router?
        - /node/key
        - /proposal/key
        - /mynodes/pg#
        - /myproposals/pg#
        - /map/
      - [ ] Build mode
      - [ ] My Nodes
      - [ ] My Edge Proposals
      - [ ] Edge Proposal
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
 



 
