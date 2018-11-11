# Interweaver's to-do items, 2018-10-17:

[X] Actually work out, fully, how Edges work.
- Yet more thoughts about how edges work (need to figure this out! It's critical to the project). Let's stick to the no-money case for now.
  - No edge shall become traversible before both parties have accepted each other's IPFS selections.
  - No traversible edge shall become nontraversible before both parties have rejected (after accepting) each other's IPFS selections.
    - But, what if they want to reject the edge itself, not the selection?
  - No IPFS shall change for a traversible edge.
  - The edge can be outright deleted by either party if it's not traversible. (this indicates opposition to the edge, without which the edge is impossible anyway.)
  - You can set your node to not accept incoming edges, if you're getting spammed?
  - It seems like I'm getting bogged down in the back-and-forth negotiations of accepting/rejecting two separate pieces of the edges...
  - What's the simplest possible feasible system?
  - Well, one-way edges that require no acceptance by the 'to' node.
    - Then you can have people arriving at your node but no way to go back.
    - This breaks immersion, I believe. Basically the WWW model. So no.
  - How about 'edge sockets' you can attach as you want (up to 6) to your node?
    - These would be half-edges with a 'node', 'ipfs', 'otherSocket' slot, and 'active' flag.
    - You would create your socket even before you knew where you wanted it to connect to. Just when you knew that you had, say, a door or path outgoing from your node.
    - If it was not attached to anything, you could change the IPFS arbitrarily.
    - If it was not attached to anything, explorers could not use the edge (or see it).
    - Then if you saw another node with an edge socket that you wanted to connect to (well, before or after your own socket)...
      - Propose a connection between your socket and theirs.
      - How do they know that you did this?
        - Each Eth address has an 'edgeProposals' array.
        - This contains {proposerSocketAddress, theirSocketAddress, proposeOrRejectFlag} in it when someone proposes to your address.
        - The proposal also ends up in your proposals array when you make a proposal.
        - Then you can query this to see any proposals you might want to act upon.
      - If they want to reject the proposal:
        - Just ignore it. It's not hurting them any (other than spamming their proposals array, but that doesn't matter.)
        - Hard-delete it (this deletes the proposal).
          - You would hard-delete if you wanted to say that an edge was unacceptable.
          - You could first mark your node 'locked', to prevent any immediate re-proposing to that node.
      - If they want to accept the proposal:
        - Call a function which puts each edgeSocket into the other edgeSocket's slot (provided they are both empty) (and deletes the proposal.)
        - Do we even need 'active' then? It would simply be that the sockets have each other in the slot.
      - If either party then wants to delete the edge:
        - Submit a reject-flagged proposal to edgeProposals.
          - This is only possible for the case where the two referred-two sockets reject each other.
          - It is proof that the party wants to delete the edge.
          - If the other party agrees to the deletion, they can then call a disconnectEdges function to unset each edge socket's slot (and deletes proposal.)
          - If the other party disagrees with the deletion, they can:
            - ignore it (just like with an edge proposal)
            - Hard-delete it (deletes the proposal - but such a thing might be valuable, since it's your ticket to delete the edge if you want.)
          - Either party can hard-delete a proposal of either sort any time they want.
      - What if another proposal gets accepted on a proposed edge in the meantime?
        - Accepting that proposal shouldn't need to reject all other proposals...
        - So the proposal just falls out of date, and is no longer able to be claimed by whichever party (trying would delete it)
        - Either party can just delete it, too.
        - Anyone looking at it would see that it's out of date by checking the half edges in question.
      - When acceptingProposal (either creating or breaking a connection), how do you know the proposal is 'real'?
        - Well, the Proposal should only exist in your list (with slot0 being someone else) if that someone else called createEdgeProposal.
        - You just need to provide proof: the index of the proposal on your list.
        - Then if index < OwnerEdgeProposals[msg.sender].length and ownerEdgeProposals[msg.sender][index] !== empty, it's a valid proposal.
        - But what if it's empty? Like, what if the originator deleted their proposal between when you saw it at 'index' and when you tried to accept?
        - Okay, just do nothing, since the proposal is gone (front-running is possible here, but no incentive.)
        - But then your array of proposals becomes pretty sparse, since there's no compaction when proposals are deleted for whatever reason.
        - This makes iterating it to find a full list of your proposals time-consuming, and it's just messy.
        - But if you do compaction (moving last element into empty hole), someone else could change indexes on you by deleting lower-indexed proposals.
        - This would make accepting a proposal by index alone risky, since they could do proposalA, then proposalB, then before you go to accept A, they delete it, swapping in B, which you then accept.
        - What if acceptEdgeProposal is modified to accept the two Proposal addresses, as well?
        - Then you, who has a list of Proposals with their indices, could do accept/rejectEdgeProposal(halfEdgeAddr0, halfEdgeAddr1, index).
        - Then the accept and reject functions would need to confirm that the proposal at that index matches the two supplied addresses.
        - If it does, it's basically like saying 'I want to connect/separate these two edges, and here's my proof of permission for doing so.'
        - If the proof works (even if someone compacted indices beneath you), you 'get what you asked for', not something else.
        - So someone could make your accept/rejects fail obnoxiously, though, by constantly scattering proposals and deleting them.
        - Ugh, I don't like your 'ticket' being able to be invalidated by some other unrelated person with no permission.
        - Okay, so new idea. Instead of a list, it's a mapping (uint64 -> Proposal) together with a maxProposalIndex
          - Wait, this is basically the same as an array, lol.
          - Either it becomes sparse and you have to iterate over holes, or you compact it, changing indices.
        - Okay, so what if it's a mapping (unchangeable uint64 -> Proposal) *plus* an array of those uint64s?
          - To add a Proposal, you would then need to set four storage values:
            - myKey = OwnerEdgeProposals[msg.sender].keyLookup.length (memory)
            - theirKey = OwnerEdgeProposals[theirAddr].keyLookup.length (memory)
            - push(OwnerEdgeProposals[msg.sender].keyLookup, myKey)
            - push(OwnerEdgeProposals[theirAddr].keyLookup, theirKey)
            - OwnerEdgeProposals[msg.sender].keyToProposal[myKey] = theProposal
            - OwnerEdgeProposals[theirAddr].keyToProposal[theirKey] = theProposal
          - Then you can iterate proposals by iterating keyLookup
          - Then you can confirm key ownership by keyToProposal[key] !== 0
          - Then you can delete a key from yours and their keyLookup and keyToProposals (again, 4 sets), and compactify it, changing the index of the last keys in the  keyLookups, but not the keys themselves.
          - Can we make this not be 4 settings?
            - What if keyToProposal was just a global mapping, making the key be shared?
            - Then keys are just addresses like anything else (maybe a kekkac of the proposal pair?)
            - So then there are two iterable arrays for the two people, containing a list of all their proposal addresses, plus the global entry.
            - Adding and removing proposals would then be 3 sets: set the global mapping, push to the two proposal arrays (or delete and move top down).
            - You could also check if a proposal exists by hashing the edge pair and looking it up in keyToProposal (one lookup)?
            - But you could also simply look up the edge pair
      - One more general issue with all this: what if you want to delete a HalfEdge with many proposals referencing it (or its host node)?
        - There's no bound on proposals to a HalfEdge (every other HalfEdge could propose, so long as it's open)
        - If it's not connected to another HalfEdge, its owner can delete it whenever they want.
        - When they do, they delete the actual HalfEdge from the global HalfEdgeLookup array, and delete its address from the Node's halfEdges array.
        - Without proposals, these would be the only two references to the HalfEdge, meaning nowhere references it.
        - With proposals, there could be thousands of invalid Proposals still out there, with its address (but not the actual HalfEdge).
        - Specifically, they'll be spamming up the Node owner's proposals array.
        - On deletion of a HalfEdge, you *could* iterate its Owner's proposals, and delete any that referred to it...
          - This is unacceptable due to being infinitely unbounded, and thus could go over maximum gas if there are tons of Proposals.
          - Even if you somehow had a list of only those Proposals referencing the deleted HalfEdge, that number is still unbounded. So no.
          - You *must* leave those Proposals behind when the HalfEdge is deleted.
        - Okay, so is this really a problem? Apart from filling up Ethereum with dead information?
          - The viewer software could just not show any Proposals whose addresses are not resolvable in HalfEdge
          - The Node owner could, if they cared, call rejectProposal (or even acceptProposal) on the invalid proposals, which would just delete them
            - This might even be inexpensive, given the storage freeing?
      - Quick thought on changing the HalfEdge IPFS (or Node IPFS, for that matter)
        - Should not be able to do this with a connected neighbor Node, since they connected because of the given IPFS.
        - So, you need to disconnect the HalfEdge if you want to change its IPFS (ie, go through the full propose/accept cycle), and then reconnect (propose/accept)
        - You need to fully disconnect your Node if you want to change its IPFS (go through full cycle for each of up to 6 HalfEdges, and then reverse to reconnect)
          - This would be 24 separate function calls for a fully-connected Node... ugh.
          - What if an IPFS change for a connected Node simply created disconnect Proposals automatically, and just changed the IPFS?
          - Then the other Node owners could disconnect if they wanted, or reject the proposals if they liked the change.
          - Nah; the IPFS-changer could then delete these auto-Proposals quickly, removing the opportunity for neighbors to disconnect.
          - Okay, so maybe fully-connected Nodes are simply really hard to change the IPFS for?
          - Or, there's some special kind of auto-Proposal that can't be rejected by its creator?
        - Uhm, thinking more about this: since Node address is defined by the IPFS...
        - You'd need to move the Node to the new address in nodeLookup, and change the address everywhere that refers to it (potentially 7 spots?)
        - So that's no fun.
        - Yeah, let's just not let you change the IPFS. If you need to, disconnect, delete, recreate, and reconnect it.
        - If you own the neighbors, that would be tedious, but easy.
        - If not, you rely on them releasing you from the edges, and hope they reconnect afterwards.
        - Basically, it's a huge pain in that case. But you really don't want to have neighbors putting questionable stuff after you connected to them...
        - Lol, I still like the "change the hash whenever, but then neighbors get a free pass to disconnect, maybe for X days" mechanism.
          - The way to do this would be for Nodes to have a 'changedHashCooldownStart' value, usually 0, but set to 'now' when you change the hash.
          - Then do indeed auto-generate disconnect proposals with that Node's neighbors (ideally with some way to see it's b/c of hash change).
          - Then only allow self-rejecting (the auto-) disconnect proposals from that Node after 'changedHashCooldownStart' is > X days ago.
        - Let's keep that kind of mechanism for a future version, perhaps when paying becomes common. For V1, changing the hash is impossible.
      - Quick thought about the with-money version:
        - This works really well with Proposal objects :D
        - An Amount can be attached to the Proposal (positive = the proposer paid money, negative = the proposer wants money)
        - When you create the Proposal, if it's positive, you must include that amount of money in the send tx, and it goes into escrow in the contract.
        - When you accept a positive Proposal, the money goes into an amountClaimable field on your Owner object.
        - When you accept a negative Proposal, you must include that amount of money in the send tx, and it goes into an amountClaimable field on proposer's Owner object.
        - When you reject a positive Proposal, the money goes into an amountClaimable field on the proposer's Owner object (which might be yours or someone else's.)
        - When you reject a negative Proposal, you must include that amount of money in the send tx, and it goes into an amountClaimable field on proposer's Owner object (yours or someone else's.)
          - What if you reject your own negative Proposal? Do you need to pay money that you can then claim back? Maybe short-circuit that particular silliness.
        
   - Okay, I think this all works and seems like a reasonable situation:
     - Node {
       owner
       IPFS
       format
       HalfEdge[6] halfEdges
     }
     - HalfEdge {
       node
       IPFS
       connectedTo
     }
     - Proposal {
       halfEdge0Addr, (always the proposer's side)
       halfEdge1Addr
     }
     - Owner {
       nodes: address[]
       proposals: address[] (it's your proposal if nodeLookup[edgeLookup[Proposal.halfEdge0Addr].node].owner = you)
     }
     - NodeLookup (address => Node)
     - HalfEdgeLookup (address => HalfEdge, replacing the Edges one)
     - ProposalLookup (address => Proposal)
     - OwnerLookup ((eth) address => Owner)
     
     - createEdgeProposal(halfEdgeAddr0, halfEdgeAddr1) {
       - require NodeLookup[HalfEdgeLookup[halfEdgeAddr0].node].owner == msg.sender (you can't propose from someone else's node)
       - require neither already connected, or are both already connected to each other (for a rejection)
       - make new Proposal {
         halfEdgeAddr0,
         halfEdgeAddr1
       }
       - Put it in OwnerEdgeProposals[yourAddr] and OwnerEdgeProposals[theirAddr]
     }
     - acceptEdgeProposal(proposalAddr) {
       - require proposalLookup[proposalAddr] !== 0
       - require NodeLookup[HalfEdgeLookup[proposal.halfEdgeAddr0].node].owner !== msg.sender (you can't accept your own proposal)
       - Delete the Proposal from proposalLookup
       - Delete proposalAddr from, and compactify, the two OwnerLookup[msg.sender or otherNodeOwner].proposals (proposal's time is up, whatever happens next)
       - If neither halfEdge slot contains the other:
         - Connect them
       - Else if both HalfEdge slots contain the other:
         - Disconnect them
       - Else:
         - Situation where either or both halfEdges have already connected to other ones. Proposal is worthless, so do nothing; it's already deleted.
     }
     - rejectEdgeProposal(proposalAddr) {
       - require proposalLookup[proposalAddr] !== 0
       - Delete proposalAddr from, and compactify, the two OwnerLookup[msg.sender or otherNodeOwner].proposals
       - Delete the Proposal from proposalLookup
       
     }
     
   
        

- [ ] Design the Interweave Network.
  - [ ] Rewrite interweave design documents into whitepaper-style document with more carefully-thought-out ideas.
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
 
- [ ] Build Version 1 of the InterweaveGraph contract.
 
- [ ] Build the network!
  - [ ] Stage 1a
    - [X] Write contract that supports non-transferrable nodes with:
      - IPFS hash
      - Owner
      - Ability to create and delete them
      - Ability to see how many nodes you own
      - Ability to get your node #n (since you can't request an actual list).
    - [ ] Add HalfEdges you can connect nodes with:
    - [ ] Node format 1 (simple text) node and edge 1 format
    - [ ] Simple front-end viewer that supports exploring a network built of nodetype1 and edgetype1
    - [ ] Build simple test network via direct function calls, not through the viewer.
  - [ ] Stage 1b
    - [ ] Viewer supports a way to add and delete nodes and keep track of your account's nodes.
  - [ ] Stage 1c
    - [ ] Viewer supports proposing/accepting/rejecting edges.
  - [ ] Stage 2a
    - [ ] Nodes ERC721 and thus transferrable
    - [ ] Edges proposable according to proposition rules.
    - [ ] Edges deletable according to edge deletion rules.
  - [ ] Stage 2b
    - [ ] Edge proposals/deletions (and node transfers?) in viewer.
  - [ ] Stage 3a
    - [ ] Nodes switch to only supporting IPFS URLs.
  - [ ] Stage 3b
    - [ ] IPFS uploads through the viewer.
  - [ ] Stage 4
    - [ ] Additional formats, like 3d, etc.
