# Interweaver's to-do items, 2018-11-01:

- IPFS kept having a problem with port 8080 (where my http-server was), so:
  - ipfs config Addresses.Gateway /ip4/0.0.0.0/tcp/9001

- [ ] Create a simple network of test Nodes on Rinkeby so I can test the dapp better (MetaMask + Ganache = totally impossible to use...)
  - [X] Draw map for at least 5 Nodes
  - [ ] Write simple versions of those Nodes
    - [X] Pillar room: QmYERLQBLwostcox5zd6EbL45RBtszhxKjgzLf2puPHn8H / 5470291676926967565549628396722245044272259106628493990869194893534145998658
    - [ ]
  - [ ] Create and connect them (at least 2 accounts)
    - [X] Connect grotto to pillar room.
  - [ ] Make sure there are some NodeProposals floating around.
  

- [ ] Build Version 1 (the "free version", i.e. without any way to exchange money) of the Interweave Network.
  - [ ] DApp
    - [ ] Rewrite the Vue app to use the InterweaveFreeContract handler functions to implement this UI
      - [X] Explore mode
        - [X] Navbar
        - [X] Render window
          - [X] Text box showing ipfs file
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
 



 
