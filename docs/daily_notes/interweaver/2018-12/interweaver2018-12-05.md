# Interweaver's to-do items, 2018-12-05:

- Thoughts about SimpleBuild flow
  - So currently targetsets and targets are enter-to-add, where you're typing into a temp variable until hitting enter.
  - When you do that, it does the checks to make sure it's not duplicate, and if not, adds it.
  - However, result is currently live-editing, where the moment you start typing, it creates a new result and edits that.
  - This is nice because you don't have to remember to hit 'enter' - node state is always exactly what you see.
  - However, when you type to something not allowed (invalid edge, or duplicate result), this is hard to fix up.
  - So either have to fix it to be non-live again, where hitting enter adds or edits the entry (unless invalid)
    - This case could be hard to convey the 'saved' versus 'not saved' states of the text area.
    - That's already the case for the target entry fields, but there it's obvious, because the entered ones aren't fields but just spans.
    - Can't do that for result - can we?
    - Maybe having it show as a text area even when not being edited is a mistake.
    - If it's just a big div with text in it, with no obvious editing, then when the text area is active, it's being edited.
    - You hit enter, and it goes back to being a div (unless invalid)
    - Then you have to click again to start editing again.
    - If it's new, it's an empty text area (maybe with faded 'click to add')
    - Hmm, this just seems a little complicated though... I really like just editing and that's it, it's saved.
  - Or, you could switch back to the newResult variable if invalid, and delete the actual Result (so it's go back to (select result) in the dropdown)
    - Then you'd switch back to an actual result whenever newResult goes to a valid result (just like you do when going from an empty newResult to non-empty)
    - This actually makes sense. If it's an invalid, non-zero newResult, could also put a red outline around the box, to make clear it's not saved.

- [ ] Build Version 1 (the "free version", i.e. without any way to exchange money) of the Interweave Network.
  - [ ] Create functional DApp:htt
    - [ ] Make build mode:
      - [ ] Make the 'delete' button do something
        - [X] If it's a draft node with no connections, just delete it, and if it was the current node, go back to the default Node.
        - [ ] If it's deployed, and has zero edges set, actually call the blockchain delete.
      - [ ] Add 'draft' Nodes
        - [ ] Make SimpleTextBuild work.
          - [ ] Make all the properties addable/removable/editable.
            - [ ] Consistency preservation:
              - [ ] Remove target sets that are not used? The flow requires them to exist before being bound, though...
                - Maybe if you switch away from having added a new one, or unbind one, that deletes it?
                - But then you can go elsewhere in the app and leave it dangling.
                - Maybe there's a pendingTargetSet which gets created until you make a binding with it, and then gets added to the actual set?
                - Then definitely remove a target set when you unbind its last binding.
              - [ ] Remove results when you delete a target set that was part of the last binding for that result.
              - [ ] Remove result when you select away from it and it was the last binding pointing to it.
              - [ ] Make sure results are unique
                - This is hard... Can't block you from typing a redundant result, or else if you were copying, and then adding to, another one, you'd get stuck.
                - Maybe that's the best solution though. This should happen rarely.
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
 



 
