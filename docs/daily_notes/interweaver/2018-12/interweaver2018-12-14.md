# Interweaver's to-do items, 2018-12-13:

- [ ] Build Version 1 (the "free version", i.e. without any way to exchange money) of the Interweave Network.
  - [ ] Create functional DApp
    - [ ] Make build mode:
      - [ ] Add 'draft' Nodes that can be deployed to the smart contract:
        - [ ] Make pushing the button on the last BuildArea page deploy the draft Node to the blockchain.
          - [X] Hook up functions
          - [X] Make sure IPFS hasn't been used already by calling getNode.
          - [X] Call addNode on the blockchain, to get it properly added.
          - [X] Make sure to save the key of the new Node in memory for re-matching the draft edges...
          - [X] Delete the draft Node using existing deletion code.
          - [X] Do a refresh of myNodes, which will include the new Node.
          - [ ] (later, once draft edges are in place) Hunt down all instances of the fake node key in myDraftEdgeProposalKeys and replace with the real one.
      - [ ] My Edge Proposals
        - [ ] Create an app mode for myedgeproposals
        - [ ] Create a test EdgeProposal or two.
        - [ ] Show paged view of all my EdgeProposal keys.
        - [ ] Load EdgeProposal blockchain data (so getting the two Node keys and epmess and slots).
      - [ ] Edge Proposal
        - [ ] Create an App mode for edgeproposal
        - [ ] Show current EdgeProposal key
        - [ ] Show blockchain data
        - [ ] Load Node data and show the names
        - [ ] Make clicking on the Nodes go to them.
    - [ ] Bugfixes:
      - [ ] Whenever draft Node content changes in the editor, unset the IPFS hash if they'd already uploaded it, since it's gone stale.
      - [ ] When Node deploy fails, should somehow update BuildArea again?
    - [ ] Add cookies to save your draft data.
    - [ ] Make a better homepage.
    - [ ] Style things up to the best of my non-designer ability.
    - [ ] Restructure repos:
      - [ ] Create new a) smart contracts, b) viewer, c) simpletext formod, d) interweave.network website repos under interweave.network github account.
      - [ ] Move code from my existing repo into them, making sure my current account has perms to do pull requests
      - [ ] Make the interweave.network website repo contain the correct composition of the other repos.
      - [ ] Set up that website instead of my current one.
      - [ ] Start developing via pull requests.
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
 



 
