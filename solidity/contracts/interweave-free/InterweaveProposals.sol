pragma solidity ^0.4.24;
import "./InterweaveGraph.sol";

contract InterweaveProposals is InterweaveGraph {
  
  /// @notice EdgeProposal struct represents a proposal to connect or disconnect two Nodes via two HalfEdges belonging to them. halfEdgeAddr0 belongs to the proposer.
  struct EdgeProposal {
    address halfEdgeAddr0;
    address halfEdgeAddr1;
  }
  
  /// @notice An EdgeProposal was created.
  /// @param edgeProposalAddr The address of the created EdgeProposal.
  /// @param proposerAddr The Ethereum address of the Owner who created the EdgeProposal.
  /// @param proposedToAddr The Ethereum address of the Owner who is the counterparty on the EdgeProposal.
  event EdgeProposalCreated(address edgeProposalAddr, address proposerAddr, address indexed proposedToAddr);
  
  /// @notice An EdgeProposal was accepted, connecting or disconnecting two Nodes.
  /// @param edgeProposalAddr The address of the accepted EdgeProposal (which will have been deleted).
  /// @param accepterAddr The Ethereum address of the Owner who accepted the EdgeProposal.
  /// @param acceptedAddr The Ethereum address of the Owner whose EdgeProposal was accepted.
  event EdgeProposalAccepted(address edgeProposalAddr, address accepterAddr, address indexed acceptedAddr);
  
  /// @notice An EdgeProposal was rejected.
  /// @param edgeProposalAddr The address of the rejected EdgeProposal (which will have been deleted).
  /// @param rejecterAddr The Ethereum address of the Owner who rejected the EdgeProposal.
  /// @param rejectedAddr The Ethereum address of the Owner who was the counterparty on the EdgeProposal.
  event EdgeProposalRejected(address edgeProposalAddr, address rejecterAddr, address indexed rejectedAddr);
  
  /// @notice A mapping allowing lookup of EdgeProposals by their addresses.
  /// @dev EdgeProposal addresses = kekkac(halfEdgeAddr0, halfEdgeAddr1)
  mapping (address => EdgeProposal) public edgeProposalLookup;
  
  function createEdgeProposal(address _halfEdgeAddr0, address _halfEdgeAddr1) external returns (address) {
    /*
    - require NodeLookup[HalfEdgeLookup[halfEdgeAddr0].node].owner == msg.sender (you can't propose from someone else's node)
    - require neither already connected, or are both already connected to each other (for a disconnection)
    - make new Proposal {
      halfEdgeAddr0,
      halfEdgeAddr1
    }
    - Put it in OwnerEdgeProposals[yourAddr] and OwnerEdgeProposals[theirAddr]
    */
  }
  
  function acceptEdgeProposal(address _edgeProposalAddr) external {
    /*
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
    */
  }
  
  function rejectEdgeProposal(address _edgeProposalAddr) external {
    /*
    - require proposalLookup[proposalAddr] !== 0
    - Delete proposalAddr from, and compactify, the two OwnerLookup[msg.sender or otherNodeOwner].proposals
    - Delete the Proposal from proposalLookup
    */
  }
  
  function getOwnerEdgeProposalCount(address _ownerAddr) public view returns (uint) {
    return ownerLookup[_ownerAddr].edgeProposalAddrs.length;
  }
  
  function getOwnerEdgeProposalAddrByIndex(address _ownerAddr, uint _index) public view returns (address) {
    require(
      _index < ownerLookup[_ownerAddr].edgeProposalAddrs.length,
      "The index supplied was >= the number of EdgeProposals belonging to the Owner."
    );
    
    return ownerLookup[_ownerAddr].edgeProposalAddrs[_index];
  }
}
