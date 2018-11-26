# Interweaver's to-do items, 2018-11-25:

- Okay, having some trouble with thinking about the Add Node button, and how it'll work versus the Edit Node button...
  - BuildArea shouldn't assume you're starting from nothing!
  - E.g., 'add node' should a) create a new draft Node, and b) pass it into BuildArea as an editable Node.
  - Whereas 'edit node' should simply pass that node into BuildArea as an editable Node.
  - In neither case is BuildArea actually creating a new Node. That's App doing that.
  - Okay, let's do that then.
        
- How should SimpleTextBuild work?
  - For each 'list' (targets, results, bindings), display enough to identify it...
  - If you click on it, it lets you see the full thing and edit it.
  - They each have an 'add' button that lets you insert another (and proceed to edit it)
  

- [ ] Build Version 1 (the "free version", i.e. without any way to exchange money) of the Interweave Network.
  - [ ] Create functional DApp:
    - [X] Convert everything to use a single unified Node object, rather than distinct ipfs and node objects... Will simplify stuff.
    - [ ] Make build mode:
      - [ ] Add 'draft' Nodes
        - [X] Give BuildArea a 'currentStep' data value
        - [X] Give BuildArea several divs that only show up when each of the steps are current.
        - [X] Give BuildArea 'clickNext' and 'clickPrevious' buttons and functions that (for now) show all the steps.
        - [X] Make the first step be picking a format (via dropdown), version (automatically latest), and name string (via text box)
        - [X] Enable the 'next' button once those are done
        - [X] Add 'view' and 'edit' buttons to each Node in My Nodes
        - [X] Make 'view' do the already-coded thing of going to that Node.
        - [X] Make App create a new NodeData when a user clicks Add Node.
        - [X] Make that NodeData get passed in to BuildArea to start it off.
        - [X] Make the 'edit' button in My Nodes activate BuildArea and pass whichever Node in to BuildArea
        - [X] Make a next button to proceed from this step.
        - [X] Make a button to deploy to IPFS.
        - [X] Fix issue with going to 'edit' an existing draft Node and nothing's loaded in the edit area.
          - Think it's just that there's no change detected that causes it to rebuild.
          - Yeah, needed to call init on 'mounted' instead of 'created' and make it do a buildRenderer create.
        - [ ] Make SimpleTextBuild work.
          - [X] Show all the properties
          - [ ] Make them all addable/removable/editable.
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
 



 
