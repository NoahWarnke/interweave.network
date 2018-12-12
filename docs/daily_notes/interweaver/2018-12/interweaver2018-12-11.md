# Interweaver's to-do items, 2018-12-11:

- [ ] Build Version 1 (the "free version", i.e. without any way to exchange money) of the Interweave Network.
  - [ ] Create functional DApp:htt
    - [ ] Make build mode:
      - [ ] Add 'draft' Nodes
        - [ ] Figure out how to interface with the IPFS API and actually accomplish that, getting back the IPFS hash.
          - Looks like file does need to exist locally.
          - [ ] Check for existance of IPFS daemon via API
            - [X] Make a function able to do that in BuildArea (using Utils.js) - just check ipfs version
              - http://localhost:5001/api/v0/version
              - Hmm, getting a CORS error, lol.
              - Okay, looks like that's IPFS configuration that needs done. Sigh, more difficulty for end users.
              - https://github.com/INFURA/tutorials/wiki/IPFS-and-CORS
              - (close down daemon for a moment)
              - ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://localhost:8080"]'
              - ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "GET", "POST"]'
              - Yep, that works now.
            - [ ] Call it whenever deciding whether to render the 'upload to IPFS' button (as opposed to the IPFS entry box)
          - [ ] Create deploy to IPFS button if it exists (with alternate ipfs input field)
            - [ ] Clicking should bring up a file-picker dialog.
            - [ ] Once you do that, it should call the IPFS add api.
              - ipfs add -q filepath/filename
              - ipfs add pin ipfshash
        - [ ] Make a button to deploy to blockchain.
          - [ ] Actually add the new Node
          - [ ] move the Node data from draftIpfsData to ipfsData,
          - [ ] remove the fake key from myDraftNodeKeys,
          - [ ] add real one to myNodeKeys
          - [ ] add blockchain data to nodes
          - [ ] Hunt down all instances of the fake node key in myDraftEdgeProposalKeys and replace with the real one.

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
    - [ ] Style things up to the best of my non-designer ability.
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
 



 
