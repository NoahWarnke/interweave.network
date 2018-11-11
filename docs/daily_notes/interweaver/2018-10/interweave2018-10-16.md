

// Simple (no $)


Needed properties:
- One node owner can propose an edge from their node to another node.
- That edge must contain their side of the edge's IPFS
- The other node owner must be able to reject (or ignore) the proposal.
  - Rejecting in a way that the first person could see would be valuable.
- The edge shouldn't get deleted until the first person withdraws.
- The first person should also be able to change the IPFS hash and have it be a fresh proposal for second node.
- If second person approves the edge, they submit their IPFS at the same time.
- First person then needs to be able to reject or approve the IPFS of the first person.
- Basically, you have two halves, which each can be either rejected or approved by the other half.
- Once they're both approved, the edge is navigable until and unless they both get rejected.
















Functions:

// Simple (no $)
proposeHalfEdge(NodeA, NodeB, IPFSOfHalfEdgeAB, Format)
  
  // Check both nodes exist.
  - Require NodeA exists in global node lookup
  - Require NodeB exists in global node lookup
  
  // Check sender has permission to do this.
  - Require NodeA belongs to msg.sender
  
  // Check formatting of edge.
  - Require NodeA.Format == Format
  - Require IPFSOfHalfEdgeAB has length 46
  
  // Check NodeA not already full or already connected to NodeB.
  - Require NodeA's outgoing list < 6 entries.
  - Require NodeA's outgoing list does not already contain a halfEdge with .to = NodeB
  - Assert NodeB's incoming list does not already contain a halfEdge with .from = NodeB. (if it does, inconsistent.)
  
  // Create the new halfEdge.
  - Create new edge object AB in global edge lookup array.
    - {from: NodeA, to: NodeB, hash: IPFSHashOfHalfEdgeAB, format: Format}
  - Add AB to NodeA's outgoing list.

  // This is accepting an existing proposal.
  - If NodeB's outgoing list has a halfEdge BA with .to = NodeA:
    - Assert BA in NodeA's incoming list. (if it doesn't, inconsistent.)
	- Remove BA from NodeA's incoming list.
	
  // This is a new proposal.
  - Else:
	- Add AB to NodeB's incoming list.

	
retractHalfEdge(AB)
  - Require AB.from.owner = msg.sender
  - Assert AB.from.outgoing contains AB (if not, inconsistent).
  
  // Edge already finalized.
  - If AB.to.outgoing contains halfEdge BA with .to = NodeA:
    // If BA.retracted, B already trying to retract.
	  // Delete both half edges.
	// If !BA.retracted, B was not trying to retract.
	  // Mark this HalfEdge as "retracted".
  
  // If no symmetric halfedge exists, edge was only proposed (by A). Delete HalfEdge.
  - If HalfEdge.from
  
	
	
	
	
	
	
	
	

// Complete:
proposeEdge(NodeA, NodeB, IPFSOfHalfEdgeAB, Format, Amount) payable
  - If payed > 0:
	-  Require payed = Amount
  - Require IPFSOfHalfEdgeAB has length 46
  - Require NodeA exists in global node lookup
  - Require NodeA belongs to msg.sender
  - Require Format == NodeA.Format
  - Require NodeA's outgoing list < 6 entries.
  - Require NodeB exists in global node lookup
  - If NodeB's outgoing list has an edge BA to NodeA:
    - (This is accepting an existing proposal.)
    - Require NodeA's incoming list has BA in it too. (if it doesn't, contract is borked.)
    - Require -Amount = BA.amount
	- Create new edge object AB in global edge lookup array.
	  - {to: NodeB, hash: IPFSHashOfHalfEdgeAB, format: Format, amount: Amount} (note, edge doesn't need to know its 'from' value; nodes know that)
	- Add AB to NodeA's outgoing list.
	- Remove BA from NodeA's incoming list.
	- If Amount !== 0:
	  - If Amount < 0:
	    - (A is being paid by B in response to B's request/proposal to accept an edge)
	    - Add -Amount to A's entry in global Claimable array.
      - Else if Amount > 0:
	    - (A is paying B in response to B's demand/proposal to accept an edge)
        - Add Amount to B's entry in global Claimable array.
  - Else
    - (This is a new proposal)
	- Create new edge objet AB in global edge lookup array.
	  - {to: NodeB, hash: IPFSHashOfHalfEdgeAB, format: Format, amount: Amount}
	- Add AB to NodeA's outgoing list.
	- Add AB to NodeB's incoming list.
	
retractEdge(AB) payable
  - Let NodeB = AB.to
  

  - If AB.amount < 0:
    - Require payed = -AB.amount
	

  
  
Reasons for half-edges instead of a pair of full directed edges, or a single edge with a format-squared format:
 - Each half-edge is created in the format of the node it originates from, by that node's owner
 - The same edge is not described twice by potentially two different formats and node owners (possible inconsistency.)
 - Incomplete edges are more obvious with only one half-edge rather than one full directed edge (missing the second).
 - Only need the usual N node formats (with edge extensions), rather than N^2 crossed-format edge formats.
 - Design decision: no directed edges. Every edge should be navigable in both directions, at least in format1.
 
