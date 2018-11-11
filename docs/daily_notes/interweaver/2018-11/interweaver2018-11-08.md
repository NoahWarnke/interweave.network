# Interweaver's to-do items, 2018-11-08:

- [ ] Create a simple network of test Nodes on Rinkeby so I can test the dapp better
  - [ ] Write simple versions of those Nodes
  - [ ] Create and connect them (at least 2 accounts)
  - [ ] Make sure there are some EdgeProposals floating around.
  
- [ ] Build Version 1 (the "free version", i.e. without any way to exchange money) of the Interweave Network.
  - [ ] DApp
    - [ ] Components and modes:
      - [ ] Build mode
        - [ ] Formod1 build mode (triggered by 'add node' button and then picking formod1 in the dropdown)
      - [ ] My Nodes
        - [X] Fix page slowness issues
          - Seem to crop up proportionally to how many times the render area gets its component replaced.
          - Chrome page renderer starts taking up more and more CPU.
          - I bet I'm not garbage-collecting those unused components properly, or something...
          - Look into this more.
          - Well okay, even if I remove the SimpleText render slot entirely, switching nodes via the node button actually adds up to problems pretty fast...
          - Hmm.
          - Okay, a tad more looking: it's 'inpage.js', which belongs to MetaMask. Urgh.
          - Turning off MetaMask, the page never slows down when I click a lot of buttons.
          - Why does this rapidly start eating all my render memory?
          - Further investigation: turning off my polling seems to fix it too?
          - So is MetaMask somehow not friendly to the polling process?
          - Maybe keep polling off for the moment...
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
 



 
