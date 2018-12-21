# Interweaver's to-do items, 2018-12-19:


  - Okay, what if the Edit Node view also contains a list of the Node's edge slots, with the status of any edges in those slots?
    - Note that empty slots could have many proposals on them.
  - Then you could start a connection from there (click one to "start a draft Edge", then go to another Node and click "create a draft Edge")

    - See the type of Edge (draft/addition proposal/deployed/deletion proposal)
    - See which Nodes are/would be connected (button to 'edit node' for both)
    - If a draft Edge:
      - Delete Draft Edge
      - Propose Edge
    - If an add proposal by them:
      - See message
      - Retract Edge Proposal
    - If an add proposal by someone else:
      - See message
      - Accept Edge Proposal
      - Reject Edge Proposal
    - If a deployed Edge:
      - Propose Edge Deletion
    - If a deployed Edge with a deletion proposal by them:
      - See message
      - Retract Edge Deletion Proposal
    - If a deployed Edge with a deletion proposal by someone else:
      - See message
      - Accept Edge Deletion Proposal
      - Reject Edge Deletion Proposal
      
- Let's get this EdgeIdentifier thing figured out more carefully.
  - Issue is that Edges come in different types.
  - Draft Edges are specified by which NodeKeys they connect, plus a possible fake ID.
  - Proposed Edges are specified by an EdgeProposalKey, and further specified by looking the nodeKeys and edgeProposalKeys up in the dictionaries.
  - Deployed Edges are specified by their two Nodes pointing to each other in a specific slot pair. No ID here.
  - Deployed-and-proposed-to-be-deleted Edges are specified by the EdgeProposalKey and their two Nodes as well.
  
  - Observation: you can always generate a fake edgeProposalKey via the API for any pair of nodeKeys and edges.
  - This might be an appropriate way to generate fake edgeProposalKeys for draft Nodes (which could turn into add proposals) and deployed edges (which could turn into delete proposals.)
  - Then edgeProposals contains a mix of real and fake items, and 

- [ ] Build Version 1 (the "free version", i.e. without any way to exchange money) of the Interweave Network.
  - [ ] Create functional DApp
    - [ ] Make build mode:
      - [ ] Deployed Nodes should have a different-looking BuildArea...
        - Okay actually, it should basically be a ManageNode view, not a BuildArea at all, b/c you're not building it anymore.
        -
        - [ ] Add a BuildArea section of each deployed Node's edge slots, with links from each slot to any draft/proposed/deployed edges.
        - [ ]
      - [ ] My Edges
        - [ ] Create a test EdgeProposal or two between diff accounts so I can test the different types.
        - [ ] Show paged view of all my EdgeProposal keys.
        - [ ] Load EdgeProposal blockchain data (so getting the two Node keys and epmess and slots).
        - [ ] When draft Node is deployed, hunt down all instances of the draft node key in myDraftEdgeProposalKeys and replace with the real one.
      - [ ] Edge:
        - [ ] Create an App mode for manageEdge
        - [ ] Show current EdgeProposal key
        - [ ] Show blockchain data
        - [ ] Load Node data and show the names
        - [ ] Make clicking on the Nodes go to them.
    - [ ] Bugfixes:
      - [ ] Whenever draft Node content changes in the editor, unset the IPFS hash if they'd already uploaded it, since it's gone stale.
        - Bonus points: delete from IPFS the node file that was previously deployed, since it's irrelevant.
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
 



 
