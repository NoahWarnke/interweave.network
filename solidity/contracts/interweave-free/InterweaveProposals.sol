pragma solidity ^0.4.24;
import "./InterweaveGraph.sol";

contract InterweaveProposals is InterweaveGraph {
  
  /// @notice EdgeProposal struct represents a proposal to connect or disconnect two Nodes via two HalfEdges belonging to them. halfEdgeKey0 belongs to the proposer.
  struct EdgeProposal {
    uint256 halfEdgeKey0;
    uint256 halfEdgeKey1;
  }
  
  /// @notice An EdgeProposal was created.
  /// @param edgeProposalKey The uint256 key of the created EdgeProposal.
  /// @param proposerAddr The Ethereum address of the Owner who created the EdgeProposal.
  /// @param proposedToKey The Ethereum address of the Owner who is the counterparty on the EdgeProposal.
  event EdgeProposalCreated(uint256 edgeProposalKey, address proposerAddr, address indexed proposedToKey);
  
  /// @notice An EdgeProposal was accepted, connecting or disconnecting two Nodes.
  /// @param edgeProposalKey The uint256 key of the accepted EdgeProposal (which will have been deleted).
  /// @param accepterAddr The Ethereum address of the Owner who accepted the EdgeProposal.
  /// @param acceptedKey The Ethereum address of the Owner whose EdgeProposal was accepted.
  event EdgeProposalAccepted(uint256 edgeProposalKey, address accepterAddr, address indexed acceptedKey);
  
  /// @notice An EdgeProposal was rejected.
  /// @param edgeProposalKey The uint256 key of the rejected EdgeProposal (which will have been deleted).
  /// @param rejecterAddr The Ethereum address of the Owner who rejected the EdgeProposal.
  /// @param rejectedKey The Ethereum address of the Owner who was the counterparty on the EdgeProposal.
  event EdgeProposalRejected(uint256 edgeProposalKey, address rejecterAddr, address indexed rejectedKey);
  
  /// @notice A mapping allowing lookup of EdgeProposals by their keys.
  /// @dev EdgeProposal keys = uint256(kekkac(halfEdgeKey0, halfEdgeKey1))
  mapping (uint256 => EdgeProposal) internal edgeProposalLookup;
  
  function createEdgeProposal(uint256 _halfEdgeKey0, uint256 _halfEdgeKey1) external {
    /*
    - require NodeLookup[HalfEdgeLookup[halfEdgeKey0].node].owner == msg.sender (you can't propose from someone else's node)
    - require neither already connected, or are both already connected to each other (for a disconnection)
    - make new Proposal {
      halfEdgeKey0,
      halfEdgeKey1
    }
    - Put it in OwnerEdgeProposals[yourKey] and OwnerEdgeProposals[theirKey]
    */
  }
  
  function acceptEdgeProposal(uint256 _edgeProposalKey) external {
    /*
    - require proposalLookup[proposalKey] !== 0
    - require NodeLookup[HalfEdgeLookup[proposal.halfEdgeKey0].node].owner !== msg.sender (you can't accept your own proposal)
    - Delete the Proposal from proposalLookup
    - Delete proposalKey from, and compactify, the two OwnerLookup[msg.sender or otherNodeOwner].proposals (proposal's time is up, whatever happens next)
    - If neither halfEdge slot contains the other:
      - Connect them
    - Else if both HalfEdge slots contain the other:
      - Disconnect them
    - Else:
      - Situation where either or both halfEdges have already connected to other ones. Proposal is worthless, so do nothing; it's already deleted.
    */
  }
  
  function rejectEdgeProposal(uint256 _edgeProposalKey) external {
    /*
    - require proposalLookup[proposalKey] !== 0
    - Delete proposalKey from, and compactify, the two OwnerLookup[msg.sender or otherNodeOwner].proposals
    - Delete the Proposal from proposalLookup
    */
  }
  
  function getOwnerEdgeProposalCount(address _ownerAddr) public view returns (uint256) {
    return ownerLookup[_ownerAddr].edgeProposalKeys.length;
  }
  
  function getOwnerEdgeProposalKeyByIndex(address _ownerAddr, uint256 _index) public view returns (uint256) {
    require(
      _index < ownerLookup[_ownerAddr].edgeProposalKeys.length,
      "The index supplied was >= the number of EdgeProposals belonging to the Owner."
    );
    
    return ownerLookup[_ownerAddr].edgeProposalKeys[_index];
  }
}
