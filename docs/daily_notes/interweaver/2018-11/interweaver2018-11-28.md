# Interweaver's to-do items, 2018-11-28:

- Thoughts on better SimpleTextBuild workflow:
  - 1. Choose a verb
    - The list should show the first verb, and also how many bindings each verb already has.
    - Once you have, show a list of the verb and its synonyms, below which:
  - 2. choose a target set (or create one)
    - The list should show whether the target set has a result or not yet.
    - If you create one, enter the first target to get it going.
    - Once you choose a target set, you can add more into an input.
    - Once you choose a target set, show a 'delete' button that unbinds it from the verb and removes its result (give a modal confirm if it's going to do that.)
  - 3. Choose a result (or create one)
    - Once result is chosen, show a 'delete' button to remove it and return to post-2.
    - Also show a 'done' button, which returns to step 1).
    - So there's no way to see all the bindings, results, or target sets at once, but each drop-down will show all the options, and you can add targets and results at the appropriate times.

- Further thoughts:
  - Should have the dropdowns stay in a line, rather than separate divs and deselect buttons, etc.
  - Synonyms should accumulate vertically below the dropdowns?
  

- [ ] Build Version 1 (the "free version", i.e. without any way to exchange money) of the Interweave Network.
  - [ ] Create functional DApp:
    - [ ] Make build mode:
      - [ ] Add 'draft' Nodes
        - [ ] Make SimpleTextBuild work.
          - [ ] Make all the properties addable/removable/editable.
            - [X] Create new cascading binding editor.
            - [ ] Make dropdowns be in line.
            - [ ] Make targets addable to existing target sets
            - [ ] Fix binding textareas having trailing newline from enter.
            - [ ] Make sure you can only select edges that exist as a result
            - [ ] Make sure targets and results are unique
            - [ ] Figure out how to remove (or not) unbound targetsets and results and edges
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
 



 
