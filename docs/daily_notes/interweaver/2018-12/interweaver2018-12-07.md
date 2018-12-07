# Interweaver's to-do items, 2018-12-07:

- [ ] Build Version 1 (the "free version", i.e. without any way to exchange money) of the Interweave Network.
  - [ ] Create functional DApp:htt
    - [ ] Make build mode:
      - [ ] Add 'draft' Nodes
        - [ ] Make SimpleTextBuild work.
          - [ ] Make all the properties addable/removable/editable.
            - [ ] Consistency preservation:
              - [X] Remove results when you delete a target set that was part of the last binding for that result.
              - [ ] Remove result when you select away from it and it was the last binding pointing to it.
              - [ ] Make sure actual results are always valid.
                - [ ] Make a function that checks the validity of a given result string (not empty, not invalid edge, not existing result)
                - [ ] Whenever newResult changes, use this function to check if it's valid.
                - [ ] If it is, and no current result, then create an actual result and create the binding, and empty newResult.
                - [ ] If it isn't, and current result, then delete the binding, set newResult to the result value, and delete the result if nowhere else uses it.
                - [ ] If nonzero and invalid, display red outline around result area.
                
        - [ ] Give Node a method to export JSON version of the contained iData (plus name/format/formatVersion)
        - [ ] Figure out how to interface with the IPFS API and actually accomplish that, getting back the IPFS hash.
        - [ ] Make a button to deploy to blockchain.
          - [ ] Actually add the new Node
          - [ ] move the Node data from draftIpfsData to ipfsData,
          - [ ] remove the fake key from myDraftNodeKeys,
          - [ ] add real one to myNodeKeys
          - [ ] add blockchain data to nodes
          - [ ] Hunt down all instances of the fake node key in myDraftEdgeProposalKeys and replace with the real one.
      - [ ] Make deleting nodes work (move delete node button to My Nodes list)
        - [ ] Move
        - [ ] Only show for draft nodes and deployed Nodes with no connections.
        - [ ] Show confirm message.
        - [ ]
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
 



 
