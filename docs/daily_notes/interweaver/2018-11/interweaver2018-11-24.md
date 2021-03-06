# Interweaver's to-do items, 2018-11-24:

        
- [ ] Build Version 1 (the "free version", i.e. without any way to exchange money) of the Interweave Network.
  - [ ] Create functional DApp:
    - [ ] Make build mode:
      - [ ] Add 'draft' Nodes
        - [X] Make a NodeData object with space for all the common fields
        - [X] Make it do a basic validation on the data, excluding 'content'.
        - [X] Make a SimpleTextNodeData object whose constructor does a deep clone of the IPFS 'content' field, and also validates at the same time.
        - [X] Upload modified IPFS files (and temporarily insert ipfs hash redirects...)
          - ipfs add -q assets/interweavegrotto.json
          - ipfs pin add ...
          - QmTTfMB5ZVZnJ9k76c8oTrwVBG4zvtD2WYw2HNGtMonKq5
          - QmVNLqAe4F6bqSZiXQafsmDxpRQkFnULyFkEE8kCMXdwaV
        - [X] Update ipfsData to import via the new NodeData stuff.
        - [X] Add a myDraftNodeKeys array to App
        - [X] Add a draftIpfsData object to App
        - [ ] Give BuildArea a 'currentStep' value
        - [ ] Make the first step be picking a format (via dropdown), version (automatically latest), and name string (via text box)
        - [ ] Enable next step once those are done (both number selector on top, and a 'next' button)
        - [ ] Also emit a message up to App that a new NodeData was created for a draft Node - give it a fake key, too.
        - [ ] Temporary: generate an automatic SimpleTextNodeData content object, and put it into the CurrentNode object.
        - [ ] Make a next button to proceed from this step.
        - [ ] Make a button to deploy to IPFS.
        - [ ] Figure out how to interface with the IPFS API and actually accomplish that, getting back the IPFS hash.
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
 



 
