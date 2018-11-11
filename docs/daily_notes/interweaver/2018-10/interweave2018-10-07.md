Notes on interweave.network project.

- Some thoughts for the whitepaper:
  - It seems to me that, up until now, tokens have largely been about being valued because of their scarcity.
  - E.g. ERC20s with limited amounts, and ERC721s that are limited-runs (Decentraland LAND)
  - Interweave nodes will be deliberately *not* scarce. Any user can make as many as they want. So where does the value come from?
    - Artistic quality (what it is): Nodes where the linked-to resource are of higher quality will be more valuable (perhaps enforce unique ipfs hash?)
    - This is like artwork, that is valuable because of its quality (or perhaps more importantly, because of which famous artist made it... Not sure if that applies here...)
    - Network effects (who it's connected to): Nodes that are located near important other nodes (high quality, famous, centrally-located relative to drop points, etc.) will be more valuable.
      - This is like Decentraland, on a more generalized scale. Decentraland has zones and streets and parks, and location relative to them has, so far, set value.
    - Properties of the node's edges (how it's connected): Nodes that have lots of unilateral-outwards or bilateral edges will be worth more than ones with only unilateral-inwards edges.
  
- Some thoughts on viewer-allowed entrance nodes (nodes viewers let new explorers start at):
  - Perhaps this is a legitimately-monetizable aspect for viewer owners...
  - Like, what if there's a mapping that does (viewerOwnerAddress => {cost: eth, entranceNodes: array(ints)})?
  - Then anyone who wanted to be a viewer could simply call a function setViewerCost to set their cost value (and start an empty array if not already set)
  - Then anyone who wanted to have an entrance node for a given viewer could simply call payForEntranceNode(viewerOwnerAddress) with the correct cost to get added to the array.
  - Then viewers could simply look up their address in that mapping and use the array to select entrance nodes.
  - Viewers, being off-chain frontends, could easily *ignore* that array, meaning purchaers would have wasted money...
  - However, this will be somewhat obvious, and people simply would not pay for entrance nodes on the scamming viewer.
  - Conversely, viewers with good reputations will always strive to represent their paid entrance nodes.
  - Probably would be a good idea to have a revokeEntranceNode function node owners could call to take themself off the list (without getting reimbursed).
  - Would be nice to be able to re-add yourself for free in that case... (but would require having an extra field in the struct, a nodeIndex => unavailable bool mapping)
  - Also, what if 'cost' was a minimum, and you *could* pay more if you wanted, and entrance node selection was biased by that?
  - Nah, that's anti-egalitarian. If you want more entrance opportunities, set up more entrance nodes.
  - What if a viewer wants a chance to vet nodes before they're added to the list?
  - That would require a whole vetting mechanism...
  - What if there's a 'blockNode' mechanism they can use that will set the node to be blocked, but only if they also refund the cost at the same time?
  - Hmm, that suggests a 'proposal' situation:
    - Node owner proposes entrance node, pays cost (to escrow). Node starts out 'proposed' (and thus not an entrance node.)
    - Proposed node: Viewer can approve the node (and then claim the cost), or node owner can retract it (and claim the cost).
    - Accepted node: Viewer can unapprove the node (and pay the cost).
    - Viewer approves node (possibly automatically - flag?) and can claim the cost.
    - Or, node owner retracts proposal, and can claim back their cost, removing the node entry entirely.
    - If approved, viewer can then block node, paying cost refund back into escrow. This is simply going back to the state it was initially.
    - Node owner then can claim the refund (aka retract the proposal) (removing the entranceNode entry entirely?)
    - Or, viewer can retract the block, and reclaim the refund and unblocking the node.
    - Once deleted, the node owner could re-propose the node from the beginning.
    

  - So: the main contract (or one of the parent ones? ViewerEntranceManager?) provides this functionality:
    - member variables:
      - ```
      ViewerData struct {
        entranceNodeCost: uint (in gwei)
        entranceNodes: array(uint)
        entranceNodeSpecialStatus: mapping (uint64 => uint8) (the uint8 is a bitfield, with 0th being locked by owner, and 1st being blocked+refunded by viewer, 2nd being refund claimed)
      }
      ```
      - private mapping viewers (address => ViewerData)
    - functions:
      - setViewerCost(uint) => address sets their viewer cost, initializing an entry in 'viewers' if it doesn't exist yet.
      - proposeEntranceNode (address viewerAddress, nodeId): node owner: cost into escrow, entranceNode entry created (but blocked)
      - unproposeEntranceNode (address viewerAddress, nodeId): node owner: if blocked, entranceNode entry deleted,
      - acceptEntranceNode (nodeId): viewer: cost now available to claim, entranceNode entry unblocked)
      - claimCost(nodeId): viewer: gets paid the cost
      - claimAllCost(): viewer: gets paid unclaimed cost for all nodes
      - unacceptEntranceNode (nodeId): viewer: pay cost into escrow, entranceNode entry blocked
    - Okay, revising: functions, take 2:
      - payForEntranceNode(address viewerAddress, nodeId) => node owner pays the entrance cost and their nodeId gets added to the viewer's entranceNodes.
      - lockEntranceNode(address viewerAddress, nodeId) => node owner locks their entrance node.
      - unlockEntranceNode(address viewerAddress, nodeId) => node owner unlocks their entrance node.
      - refundAndBlockEntranceNode(nodeId) => viewer pays the entrance cost back to node owner, and blocks the entrance node.
      - claimRefund(viewerAddress, nodeId) => node owner claims their refund if they got blocked.
      - unblockEntranceNode(nodeId) => viewer unblocks entrance node
    - Interestingly, this is almost how the edges mechanism will work.
    - Um, maybe it would make sense to just think of this as an edge...
    - Viewer creates their own node (perhaps nodes can be flagged entranceNodes, meaning they aren't explorable in the normal sense, have no resource, and infinite edges?)
    - Then they propose connections to other nodes, or other users propose connections to them, with all the associated edge price proposing logic intact.
    - Nodes could also have an 'autoAcceptEdges' field, that takes a minimum price, and possibly a requirement about the removal.
    - Edges would then need a 'proposal' flag (I think that's already specified) during which they are unexplorable.
    - Whoa, what if entranceNodes had, as their resource, an ipfs link to the entire viewer frontend? :O
    - Maybe that's a bit much lol. But I'm imagining popping up on some random website after going to the viewer node from a connected node...
    - Nah, viewers are meant to wrap the exploring experience, not be locations within it (that's what the Web is for, lol.)
  

 [X] Create Reddit accounts (1 normal, 1 project), get some practice with that.
 - 'interweaver': personal
 - 'interweave_network': project
 
 [X] Build basic knowledge of Solidity and web3.js
  [X] Trap case where the getLink fails (shouldn't - it's not a transaction?)
  - It's using the 'call' Contract method.
  - This has an optional callback param (after an options object).
  - This param gets (err, result) as its params.
  - Returns a promise.
  - So looks like trapping the promise throwing an error would be the best approach?
  [X] Trap case where the setLink send fails
  - setLink is using 'send' Contract method.
  - This also has an optional callback, which receives the tx number.
  - But more importantly, it returns a 'promiEvent', which lets you watch for assorted events.
  - 'receipt' event: the result of the transaction's function call.
  - 'error' event: if the transaction fails. (second param is receipt if out of gas).
  - 'confirmation' event: fired for each confirmation (up to 24). Gives (number, receipt) params.
  - 'transactionHash': returns right after tx sent and hash available.
  [X] Trap case where the setLink succeeds (and show waiting graphics until then, etc.) and update value.
 
 [ ] Design the network.
  [ ] Rewrite interweave design document into whitepaper-style document with more carefully-thought-out ideas.

 [ ] Build the network!
  [ ] Stage 1a
  - Non-transferrable nodes (not yet ERC721)
  - Non-deletable edges that you can create between any of your own nodes (that don't already have an edge)
  - Uses normal URLs for the link value (up to 100 chars)
  - Node format #1 (simple text) node and edge 1 format (edge-edge, edge-else, else-edge)
  - Simple front-end viewer that supports exploring a network built of nodetype1 and edgetype1
  - Network built via direct function calls, not through the viewer.
  
  [ ] Stage 1b
  - Viewer supports a way to add nodes and edges and keep track of your account's nodes.
  
  [ ] Stage 1c
  - Node format #2 (images) and edges 2 format (image-image, image-else, else-image)
 
  [ ] Stage 2a
  - Nodes ERC721 and thus transferrable
  - Edges proposable according to proposition rules.
  - Edges deletable according to edge deletion rules.
  
 [ ] Stage 2b
  - Edge proposals/deletions (and node transfers?) in viewer.
  
 [ ] Stage 3a
  - Nodes switch to only supporting IPFS URLs.
  
 [ ] Stage 3b
  - IPFS uploads through the viewer.
  
 [ ] Stage 4
  - additional formats, like 3d, etc.
