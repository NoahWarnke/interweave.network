# Interweaver's to-do items, 2018-12-08:

- [ ] Build Version 1 (the "free version", i.e. without any way to exchange money) of the Interweave Network.
  - [ ] Create functional DApp:htt
    - [ ] Make build mode:
      - [ ] Add 'draft' Nodes
        - [ ] Make SimpleTextBuild work.
          - [ ] Make all the properties addable/removable/editable.
            - [ ] Consistency preservation:
              - [ ] Make sure actual results are always valid.
                - New invariant:
                  - newResult is always bound to the textarea.
                  - It may contain valid or invalid result values.
                  - If it is invalid, then there is no current binding or actual result
                    - If there were any previously when it goes invalid, the binding gets deleted, and the result as well, if it was the last binding.
                  - If it is valid, then there is also a corresponding binding and result.
                    - if going from invalid to valid, resultKey will be currently undefined...
                    - check first to see if the newly valid result already exists, and if so, use its key rather than creating a new result.
                    - if resultKey is not undefined, then it's an update to an existing result, so just change the result value.
                - [X] Make a function that checks the validity of a given result string (not empty, not invalid edge, not existing result)
                - [ ] Make there only be one result entry box, bound to newResult (not one bound to the actual value)
                - [ ] Whenever newResult changes, use this function to check if it's valid.
                - [ ] If it is,
                  - [ ] if resultKey is undefined, then check for existing results with the same value as the new newResult...
                    - [ ] if none exist, create a new result and create the binding.
                    - [ ] If one exists, set resultKey to that key, and create the binding.
                  - [ ] If resultKey is defined, then just update the existing result.
                - [ ] If it isn't,
                  - [ ] If resultKey is defined, then delete the current binding, and if no more bindings for that result, delete it as well.
                  - [ ] If newResult not "", display red outline around result area.
                
        - [ ] Give Node a method to export JSON version of the contained iData (plus name/format/formatVersion)
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
 



 
