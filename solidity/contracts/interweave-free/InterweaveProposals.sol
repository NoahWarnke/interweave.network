pragma solidity ^0.4.24;
import "./InterweaveGraph.sol";

contract InterweaveProposals is InterweaveGraph {
  
  /// @notice EdgeProposal struct represents a proposal to connect or disconnect two Nodes via specific slots. The Node at nodeKey0 belongs to the proposer.
  struct EdgeProposal {
    uint256 nodeKey0;
    uint256 nodeKey1;
    uint64 slot0; // uint64 instead of uint8 so that these four values all fit into one uint256 storage slot.
    uint64 slot1;
    uint64 ownerEdgeProposalsIndex0; // These two indexes upport efficient deleting of EdgeProposals from their Owner lists.
    uint64 ownerEdgeProposalsIndex1;
  }
  
  /// @notice An EdgeProposal was created.
  /// @param edgeProposalKey The uint256 key of the created EdgeProposal.
  /// @param proposerAddr The Ethereum address of the Owner who created the EdgeProposal.
  /// @param proposedToAddr The Ethereum address of the Owner who is the counterparty on the EdgeProposal.
  event EdgeProposalCreated(uint256 edgeProposalKey, address proposerAddr, address indexed proposedToAddr);
  
  /// @notice An EdgeProposal was accepted, connecting or disconnecting two Nodes.
  /// @param edgeProposalKey The uint256 key of the accepted EdgeProposal (which will have been deleted).
  /// @param accepterAddr The Ethereum address of the Owner who accepted the EdgeProposal.
  /// @param acceptedAddr The Ethereum address of the Owner whose EdgeProposal was accepted.
  event EdgeProposalAccepted(uint256 edgeProposalKey, address accepterAddr, address indexed acceptedAddr);
  
  /// @notice An EdgeProposal was rejected.
  /// @param edgeProposalKey The uint256 key of the rejected EdgeProposal (which will have been deleted).
  /// @param rejecterAddr The Ethereum address of the Owner who rejected the EdgeProposal.
  /// @param rejectedAddr The Ethereum address of the Owner who was the counterparty on the EdgeProposal.
  event EdgeProposalRejected(uint256 edgeProposalKey, address rejecterAddr, address indexed rejectedAddr);
  
  /// @notice An edge between Nodes was created.
  /// @param nodeKey0 The uint256 key of Node 0.
  /// @param slot0 The uint8 slot belonging to Node 0 that was connected.
  /// @param slot1 The uint8 slot belonging to Node 1 that was connected.
  /// @param nodeKey1 The uint256 key of Node 1.
  /// @param ownerAddr0 The address of the owner of Node 0.
  /// @param ownerAddr1 The address of the owner of Node 1.
  event EdgeCreated(uint256 nodeKey0, uint8 slot0, uint8 slot1, uint256 nodeKey1, address indexed ownerAddr0, address indexed ownerAddr1);
  
  /// @notice An edge between Nodes was deleted.
  /// @param nodeKey0 The uint256 key of Node 0.
  /// @param slot0 The uint8 slot belonging to Node 0 that was disconnected.
  /// @param slot1 The uint8 slot belonging to Node 1 that was disconnected.
  /// @param nodeKey1 The uint256 key of Node 1.
  /// @param ownerAddr0 The address of the owner of Node 0.
  /// @param ownerAddr1 The address of the owner of Node 1.
  event EdgeDeleted(uint256 nodeKey0, uint8 slot0, uint8 slot1, uint256 nodeKey1, address indexed ownerAddr0, address indexed ownerAddr1);
  
  /// @notice A mapping allowing lookup of EdgeProposals by their keys.
  /// @dev EdgeProposal keys = uint256(kekkac(halfEdgeKey0, halfEdgeKey1))
  mapping (uint256 => EdgeProposal) internal edgeProposalLookup;
  
  /// @notice A function to generate a unique key for an EdgeProposal from given Nodes and their slots.
  /// @param _nodeKey0 The uint256 key of the first Node.
  /// @param _slot0 The uint8 slot of the first Node.
  /// @param _slot1 The uint8 slot of the second Node.
  /// @param _nodeKey1 The uint256 key of the second Node.
  /// @return A uint256 key.
  function edgeProposalKeyFromNodesAndSlots(uint256 _nodeKey0, uint8 _slot0, uint8 _slot1, uint256 _nodeKey1) public pure returns (uint256) {
    return uint256(
      keccak256(
        abi.encodePacked(
          _nodeKey0,
          _slot0,
          _slot1,
          _nodeKey1
        )
      )
    );
  }
  
  /// @notice Create an EdgeProposal, between the Nodes with the given keys, via their given slots. Simply immediately toggle an edge if both are owned by msg.sender. Will error if they are neither connected nor disconnected.
  /// @param _nodeKey0 The uint256 key of the first Node to connect to/disconnect from the second one.
  /// @param _slot0 The uint8 slot of the first Node to connect/disconnect through.
  /// @param _slot1 The uint8 slot of the second Node to connect/disconnect through.
  /// @param _nodeKey1 The uint256 key of the second Node to connect to/disconnect from the first one.
  function createEdgeProposal(uint256 _nodeKey0, uint8 _slot0, uint8 _slot1, uint256 _nodeKey1) external {
    
    // Make sure slots are in a valid range.
    require(
      _slot0 < 6 && _slot1 < 6,
      "Both slots must be in the range 0-5."
    );
    
    Node storage node0 = nodeLookup[_nodeKey0]; // TODO check if storage is needed.
    
    // Make sure Node 0 exists and is owned by msg.sender.
    require(
      node0.ownerAddr == msg.sender,
      "You must own the Node at _nodeKey0 in order to manage its edge Nodes, or it might not even exist."
    );
    
    Node storage node1 = nodeLookup[_nodeKey1]; // TODO check if storage is needed.
    
    // Make sure Node 1 exists.
    require(
      node1.ownerAddr != 0,
      "The Node at _nodeKey1 must exist."
    );
    
    // Make sure Nodes and their slots are in valid connect or disconnect configuration.
    require (
      (node0.edgeNodeKeys[_slot0] == _nodeKey1 && node1.edgeNodeKeys[_slot1] == _nodeKey0)
      || (node0.edgeNodeKeys[_slot0] == 0 && node1.edgeNodeKeys[_slot1] == 0),
      "The Nodes slots at _nodeKey0 _slot0 and _nodeKey1 _slot1 must be either both connected to each other or both disconnected from any Node."
    );
    
    // If Node 1 is owned by msg.sender, don't create a proposal at all: just connect/disconnect the nodes!
    if (node1.ownerAddr == msg.sender) {
      // Since we already confirmed they are in valid configuration, a simple check if one slot is 0 or not is enough to let us know what to do.
      if (node0.edgeNodeKeys[_slot0] == 0) {
        // Connect 'em.
        node0.edgeNodeKeys[_slot0] = _nodeKey1;
        node1.edgeNodeKeys[_slot1] = _nodeKey0;
        
        emit EdgeCreated(_nodeKey0, _slot0, _slot1, _nodeKey1, msg.sender, msg.sender);
      }
      else {
        // Disconnect 'em.
        node0.edgeNodeKeys[_slot0] = 0;
        node1.edgeNodeKeys[_slot1] = 0;
        
        emit EdgeDeleted(_nodeKey0, _slot0, _slot1, _nodeKey1, msg.sender, msg.sender);
      }
      return; // Done, in either case.
    }
    
    // Node 1 is not owned by msg.sender, so continue with an actual EdgeProposal.
    
    uint256 newEdgeProposalKey = edgeProposalKeyFromNodesAndSlots(_nodeKey0, _slot0, _slot1, _nodeKey1);
    
    require(
      edgeProposalLookup[newEdgeProposalKey].nodeKey0 == 0,
      "This exact EdgeProposal already exists. You can reject it if you want."
    );
    
    uint256 reverseEdgeProposalKey = edgeProposalKeyFromNodesAndSlots(_nodeKey1, _slot1, _slot0, _nodeKey0);
    
    require(
      edgeProposalLookup[reverseEdgeProposalKey].nodeKey0 == 0,
      "The reverse of this EdgeProposal already exists. You can either reject or accept it."
    );
    
    // Okay, we're clear to actually create the EdgeProposal.
    uint256[] storage edgeProposalKeys0 = ownerLookup[msg.sender].edgeProposalKeys;
    uint256[] storage edgeProposalKeys1 = ownerLookup[node1.ownerAddr].edgeProposalKeys;
    
    EdgeProposal memory newEdgeProposal = EdgeProposal({
      nodeKey0: _nodeKey0,
      nodeKey1: _nodeKey1,
      slot0: uint64(_slot0),
      slot1: uint64(_slot1),
      ownerEdgeProposalsIndex0: uint64(edgeProposalKeys0.length),
      ownerEdgeProposalsIndex1: uint64(edgeProposalKeys1.length)
    });
    
    edgeProposalLookup[newEdgeProposalKey] = newEdgeProposal;
    
    edgeProposalKeys0.push(newEdgeProposalKey);
    edgeProposalKeys1.push(newEdgeProposalKey);
    
    // Log the EdgeProposal creation.
    emit EdgeProposalCreated(newEdgeProposalKey, msg.sender, node1.ownerAddr);
  }
  
  function acceptEdgeProposal(uint256 _edgeProposalKey) external {
    
    EdgeProposal memory edgeProposal = edgeProposalLookup[_edgeProposalKey];
    
    require(
      edgeProposal.nodeKey0 != 0,
      "The EdgeProposal at _edgeProposalKey must exist."
    );
    
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
    
    EdgeProposal memory edgeProposal = edgeProposalLookup[_edgeProposalKey];
    
    // Make sure the EdgeProposal exists and msg.sender is on either end of it.
    address[2] memory nodeOwnerAddrs = [
      nodeLookup[edgeProposal.nodeKey0].ownerAddr,
      nodeLookup[edgeProposal.nodeKey1].ownerAddr
    ];
    require(
      nodeOwnerAddrs[0] == msg.sender || nodeOwnerAddrs[1] == msg.sender,
      "You must be either the proposer or the proposee to reject this EdgeProposal, or it might not even exist."
    );
    
    // Delete it from the lookup.
    delete edgeProposalLookup[_edgeProposalKey]; // Free up storage
    
    // For each of the two Owners, remove _edgeProposalKey from their edgeProposalKeys arrays, and swap the last keys into the holes, if any.
    for (uint8 i = 0; i < 2; i++) {
      
      // Delete the EdgeProposal from the two Owners' edgeProposalKeys arrays:
      // ...Get that array as storage because we'll be using it several times, modifying it, and want the changes to stick.
      uint256[] storage edgeProposalKeys = ownerLookup[nodeOwnerAddrs[i]].edgeProposalKeys;
      
      // ...If the EdgeProposal is not the last element in the array, swap the last element over top of it.
      uint64 index = (i == 0 ? edgeProposal.ownerEdgeProposalsIndex0 : edgeProposal.ownerEdgeProposalsIndex1);
      uint64 lastIndex = uint64(edgeProposalKeys.length - 1);
      if (index < lastIndex) {
        uint256 movedKey = edgeProposalKeys[lastIndex];
        
        edgeProposalKeys[index] = movedKey; // Storage update
        
        if (nodeOwnerAddrs[i] == nodeLookup[edgeProposalLookup[movedKey].nodeKey0].ownerAddr) {
          edgeProposalLookup[movedKey].ownerEdgeProposalsIndex0 = index; // Storage update.
        }
        else {
          edgeProposalLookup[movedKey].ownerEdgeProposalsIndex1 = index; // Storage update.
        }
      }
      
      // ...Either way, then delete the last element and shrink the array (free up storage))
      delete edgeProposalKeys[lastIndex];
      edgeProposalKeys.length--;
    }
    
    // Log the EdgeProposal rejection.
    emit EdgeProposalRejected(_edgeProposalKey, msg.sender, nodeOwnerAddrs[nodeOwnerAddrs[0] == msg.sender ? 1 : 0]);
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
