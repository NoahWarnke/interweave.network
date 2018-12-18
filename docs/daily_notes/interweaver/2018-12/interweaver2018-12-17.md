# Interweaver's to-do items, 2018-12-17:

- So thoughts on editing edges...
  - This ideally will be the combined interface for draft edges, edge proposals, and actual edges, created in that order.
  - Edges really don't make much sense without nodes...
  - It should almost be an actual graph view.
  - Then nodes are circles, and the edges are lines.
  - You could click on a Node to get a list of its edges, and then click to cancel existing ones, or click one slot, and then another Node's slot, to connect.
  - Eh, the problem with this is that it makes it hard to manage all of your edge proposals.
  - Like, you want a way to just see all the newest proposals so you can choose to reject/ignore.
  - So probably you'd need to be able to filter the graph by several things...
    - Deployed Nodes
    - Draft Nodes
    - Unconnected Nodes
    - Nodes with draft Edges
    - Nodes with Edges proposed by me
    - Nodes with Edges proposed by someone else
  - Okay, that lets you see all the Nodes and proposals, but not in most-recent order.
  - So maybe this is just a third view (that I can do later, since it would be more graphics-heavy)?
  - So what's the MVP edge proposals view?
  - As considered a while ago, probably just a filterable, orderable list akin to the Nodes view.
  - Each draft Edge and Edge Proposal is an item in the list.
  - Can filter by the above categories.
  - But okay, now we've removed Nodes entirely from this view.
  - This makes it impossible to see which have already been connected, and to choose pairs to start a connection from.
  - Okay, what if the Edit Node view also contains a list of the Node's edge slots, with the status of any edges in those slots?
    - Note that empty slots could have many proposals on them.
  - Then you could start a connection from there (click one to "start a draft Edge", then go to another Node and click "create a draft Edge")
  - This would be good for seeing that specific Node's status.
  - However, again, fails on the "see all my edge proposals that I might want to take action on" need.
  - So yeah, let's have the My Edges list be a list of all your Edges, sortable by type and most recent.
  - That way the per-Node stuff is handled in Edit Node, and the my-overall-account edge stuff is handled in My Edges.
  - Is there an Edit Edge view too? This would be the place to:
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
  - I mean, this looks like a lot, and therefore appropriate for its own view.
  - But really it's just two Node links, a type, possibly a message, and possibly two additional buttons.
  - Well yeah, technically you could fit that into a small box for each Edge in My Edges...
  - I think it'd be better to have it on its own page though, thinking about smaller screen sizes.
  
      

- [ ] Build Version 1 (the "free version", i.e. without any way to exchange money) of the Interweave Network.
  - [ ] Create functional DApp
    - [ ] Make build mode:
      - [ ] My Edges
        - [ ] Create a test EdgeProposal or two.
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
 



 
