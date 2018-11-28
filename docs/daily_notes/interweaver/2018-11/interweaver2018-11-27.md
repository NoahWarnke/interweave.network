# Interweaver's to-do items, 2018-11-27:

- Thoughts about how to make SimpleText building/editing as easy as possible...
  - To add, have an input with a 'add' button that appears next to it when you've typed anything into it.
  - To edit, click on the tag, which turns into an input and edits until you hit 'enter' or 'escape'
  - To delete, simply delete all the way to 0 when editing.
  - Can only have one open at a time: click another, and it's the same as hitting 'enter' for the first one.
  - Will need a 'currentlyEditing' field somewhere to keep track of this all..
  - Will also probably want an 'editableField' component to avoid duplication?
    - You pass it a prop that's editable.
    - It emits an event when it's opened up and closed.
    - But how to let the other instances know to close up? a prop?

- [ ] Build Version 1 (the "free version", i.e. without any way to exchange money) of the Interweave Network.
  - [ ] Create functional DApp:
    - [ ] Make build mode:
      - [ ] Add 'draft' Nodes
        - [ ] Make SimpleTextBuild work.
          - [ ] Make all the properties addable/removable/editable.
            - [ ] Results:
              - [ ] Add a currentEditingResult variable, which takes a resultKey
              - [ ] Make it get set when you click on a given result
              - [ ] Make that result show an input binding to the text, instead of a span.
              - [ ] Make typing enter or escape unselect it.
              - [ ] Make it also show an 'x'button next to it.
              - [ ] Make the 'x' delete it.
              - [ ] Add an empty input at the bottom
              - [ ] Make typing something in it and then hitting enter add a new result.
            - [ ] Make target sets editable
              - [ ] Add a 'addTargetSet' method and a button in the target sets area that triggers it
              - [ ] Make it add a new targetset with no entries.
              - [ ] Add a 'deleteTargetSet' method and a button in any empty targetset that triggers it
              - [ ] Make it delete an empty targetset.
              - [ ] Add a 'addTarget' method and a button at the end of each target set that triggers it
              - [ ] Make it add a new target to the given targetset (what should it start as? needs to be unique.)
              - [ ] Make clicking on a target turn it into an input where you can edit it (and also show trash/done buttons)
              - [ ] Make the trash button work to delete the target
              - [ ] Make the done button work to close the input
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
 



 
