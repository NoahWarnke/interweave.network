So, NodeWorld|interweave|universeth|etherverse.network| thoughts, most recent:

- There are nodes:

struct NodeProperties {
    string ipfs;    // The ipfs address (ipfs assumed)
    uint256 format; // Type of resource represented at the address (how it's to be interpreted, e.g. text, 3d, image, etc.)
}
struct Node {
    uint256 id;  // Id of this Node (its index in the overall nodes array? Or perhaps better, keccak256 of the NodeProperties, stringified, to produce a UUID - then nodes mapping)
    address owner; // Address of Node's owner (who can accept and propose edges to/from this Node, and give or sell this Node)
    NodeProperties properties; 
    Edge[] attachedEdges; // Also keep track of all Edges attached to this Node
    Offer[] auction; // An array containing {address, amount, offerId} sets, in ascending order. The topmost one can be accepted to get paid and change the Node's ownership.
}

- There are edges:

struct Edge {
    uint256 node0; // Id of one side of this Edge.
    uint256 node1; // Id of other side of this Edge. (edges are not directed - you can always travel both ways along them.
    bool owned0; // True if node0's owner 'owns' (can sign to unilaterally delete - if neither 'owns', they can bilaterally delete) this Edge
    bool owned1; // True if node1's owner 'owns' this Edge
    uint8 accepted; // 0 = freshly proposed. 1 = accepted by node1's owner and ready to go. 2 = proposed delete (by node0 owner) in bilateral cas, 3 = proposed delete by node1 owner
    uint256 proposingOffer; // number of eth. Positive if proposed to be paid by node1 owner to node0 owner, negative if to be paid by node0 owner to node1 owner.
    string ipfs; // ipfs address of edge resource.
    uint256 format; // Type of transition (text, movie, 3d, 3d to text, etc...)
}

- Basic setup:
  - Users can 'createNode' whenever they want.
  - These nodes start out connected to nothing, basically floating in the nether, a baby universe: a renderable point. 
  
  - Users can create Edges between their own Nodes whenever they want.
    - If an Edge is proposed between two nodes owned by the same account, it will be immediately accepted, and the ownership set to 1 for both owned0 and owned1 since they are the same.
  
  - Users can 'proposeEdge', creating Edges between one of their Nodes and one of someone else's Nodes, only if no Edges already exist between that pair of Nodes.
  - This proposal creates a new Edge, which contains, specifically for the proposal:
    - the proposed ownership of the edge (neither (bilateral), one, the other, or both unilaterally can delete it)
    - potentially a cost value (to be payed by node0 owner if positive, or by node1 owner if negative).
    - If positive, the eth amount in question must be paid at the same time into escrow in the contract.
  - node1 users can accept Edge proposals to their Nodes.
  - If node1 users 'acceptEdge', if the cost value is negative, they need to pay that eth right then in order to accept. If it's negative, the eth in escrow in the contract is paid to them.
    - proposalStatus goes to 1, meaning the Edge is created and ready to go.
  - If proposee calls 'deleteEdge', any escrowed eth is returned to its owner, and the edge is deleted.
  - A proposer can withdraw ('deleteEdge') their proposed Edge, leading to any escrowed eth being returned to them and the Edge being deleted.
  - Once an Edge is accepted, owned0 and owned1 dictate whether the Edge can be deleted bilaterally or unilaterally by either or both owners. No eth changes hands here.
  - For a bilateral delete, 'accepted' gets changed to 2 or 3 depending on which node owner proposes the delete. If the other one deletes too, then it gets removed.
  - While a deletion is proposed, the deletion proposer can cancel that proposal and take the node back to status 1.

  - Users can 'delete' their Nodes if they have no accepted attached edges (need to delete the edges first if they already exist... which may require buy-in :) )
  - Users can 'offer' an amount for another Node, placing that eth in escrow (can be 0 if someone simply wants to be given the node). 
  - Users can 'acceptAuction' their Node if there are offers for it, giving them the eth in the node's escrow and returning it to everyone else in the offers list.
  - Users can 'unOffer' if they want to withdraw an offer for a Node.
  
  - Users can 'offerAll' an amount for a list of Nodes (which must all be owned by the same owner), with the same process as above
  
  - Users can 'change' their Nodes' ipfs links and format values. 
  - They must get the signature of the owners of all Nodes connected to that Node by Edges, however! (Nobody if it's only their own nodes attached.)
    - This seems annoying, but guarantees your Edges to someone else's Node don't end up pointing to something that wasn't there when you built the Edge.


Regarding possible future rent:
 - 'systemFeePercent' is a fixed percentage in eth, which is tacked on to any 'offer' and 'proposeEdge' or 'acceptEdge' actions (where eth gets paid into escrow).
 - The fee wouldn't be collected until 'acceptAuction' or 'acceptEdge' events (the eth gets paid out of escrow to a different account). 
 - It would be returned to its original owner if 'rejectEdge' or 'unOffer' or 'acceptAction (for a higher bid) happens.
 - Thus, all *paid- edge creations and *paid- node auctions result in a fee being paid to the contract.
 - This fee would simply build up until rent happens in the future, and then would be used to pay it off.
 - 'systemFee' could be adjusted by the contract owner to make sure rent is accounted for properly.
 
 - A greedy contract owner could also build in a 'ownerFeePercent', which would be the fraction of system fees that they are eligible to collect into their own account...
 - However, this sets up a conflict of interest, in that the owner would be incentivised to raise fees as high as they can.
 - Without that, they would be incentivized to keep the fee as low as possible, in order to draw in more users. 
 - Ethereum rent would then set the floor for fees (so could be 0 until rent.)
 - The incentivization for the owner would be the value attached to important nodes, which presumably theirs, being the first nodes in the interweave, would be.
 - They could sell them, or more importantly, sell the right to connect to them with edges, to get return on their investment.
 - Thereafter, value would be ascribed to the 'coolest' nodes, to the most interestingly-connected ones, or to the most well-linked (from the outside) nodes. Basic network effects.
 
Regarding the front-end:

- The entire system's value would come from exploring the 'verse!
- This requires a 'verse viewer, which could be multiple separate projects that connect to the blockchain to get the actual graph.
- You 'drop in' at any popular node that someone's set to be the default node (or a nodelink url?)
- Then the viewer takes care of navigation, presenting each Node's ipfs interpreted according to the format, and offering Edges from there (invisibly, if they were 3d edge boundaries.)
- A good viewer would also wrap all of the above Node/Edge creation/deletion/proposing/offering/accepting functionality (perhaps by having a list of all your Nodes and any notifications of open offers on them).

- Existing games could build on top of this, creating a custom format and ipfs link that simply imports their game engine, and try to get buy-in from the viewer in question.
  -  They would then simply create some nodes that they own, match them up to locations in their game, build 3d Edges between them (transition-starting planes?), and link into their root Node from their website or whatever.
  


  
  
