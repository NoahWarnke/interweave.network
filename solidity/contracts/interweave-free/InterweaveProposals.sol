pragma solidity ^0.4.24;
import "./InterweaveGraph.sol";

contract InterweaveProposals is InterweaveGraph {
  
  /// @notice EdgeProposal struct represents a proposal to connect or disconnect two Nodes via specific slots. The Node at nodeKey0 belongs to the proposer.
  struct EdgeProposal {
    uint256 nodeKey0;
    uint256 nodeKey1;
    bytes32 messageAndSlots; // byte 30 is slot0 and byte 31 is slot1
  }
  
  /// @notice An EdgeProposal was created.
  /// @param edgeProposalKey The uint256 key of the created EdgeProposal.
  /// @param proposerAddr The Ethereum address of the Owner who created the EdgeProposal.
  /// @param proposedToAddr The Ethereum address of the Owner who is the counterparty on the EdgeProposal.
  event EdgeProposalCreated(uint256 edgeProposalKey, address indexed proposerAddr, address indexed proposedToAddr);
  
  /// @notice An EdgeProposal was accepted, connecting or disconnecting two Nodes.
  /// @param edgeProposalKey The uint256 key of the accepted EdgeProposal (which will have been deleted).
  /// @param accepterAddr The Ethereum address of the Owner who accepted the EdgeProposal.
  /// @param acceptedAddr The Ethereum address of the Owner whose EdgeProposal was accepted.
  event EdgeProposalAccepted(uint256 edgeProposalKey, address indexed accepterAddr, address indexed acceptedAddr);
  
  /// @notice An EdgeProposal was rejected.
  /// @param edgeProposalKey The uint256 key of the rejected EdgeProposal (which will have been deleted).
  /// @param rejecterAddr The Ethereum address of the Owner who rejected the EdgeProposal.
  /// @param rejectedAddr The Ethereum address of the Owner who was the counterparty on the EdgeProposal.
  event EdgeProposalRejected(uint256 edgeProposalKey, address indexed rejecterAddr, address indexed rejectedAddr);
  
  /// @notice An edge between Nodes was created.
  /// @param nodeKey0 The uint256 key of Node 0.
  /// @param nodeKey1 The uint256 key of Node 1.
  /// @param slot0 The uint8 slot belonging to Node 0 that was connected.
  /// @param slot1 The uint8 slot belonging to Node 1 that was connected.
  /// @param ownerAddr0 The address of the owner of Node 0.
  /// @param ownerAddr1 The address of the owner of Node 1.
  event EdgeCreated(uint256 nodeKey0, uint256 nodeKey1, uint8 slot0, uint8 slot1, address indexed ownerAddr0, address indexed ownerAddr1);
  
  /// @notice An edge between Nodes was deleted.
  /// @param nodeKey0 The uint256 key of Node 0.
  /// @param nodeKey1 The uint256 key of Node 1.
  /// @param slot0 The uint8 slot belonging to Node 0 that was disconnected.
  /// @param slot1 The uint8 slot belonging to Node 1 that was disconnected.
  /// @param ownerAddr0 The address of the owner of Node 0.
  /// @param ownerAddr1 The address of the owner of Node 1.
  event EdgeDeleted(uint256 nodeKey0, uint256 nodeKey1, uint8 slot0, uint8 slot1, address indexed ownerAddr0, address indexed ownerAddr1);
  
  /// @notice A mapping allowing lookup of EdgeProposals by their keys.
  /// @dev EdgeProposal keys = uint256(kekkac(halfEdgeKey0, halfEdgeKey1))
  mapping (uint256 => EdgeProposal) internal edgeProposalLookup;
  
  /// @notice A function to generate a unique key for an EdgeProposal from given Nodes and their slots.
  /// @param _nodeKey0 The uint256 key of the first Node.
  /// @param _nodeKey1 The uint256 key of the second Node.
  /// @param _slot0 The uint8 slot of the first Node.
  /// @param _slot1 The uint8 slot of the second Node.
  /// @return A uint256 key.
  function edgeProposalKeyFromNodesAndSlots(uint256 _nodeKey0, uint256 _nodeKey1, uint8 _slot0, uint8 _slot1) public pure returns (uint256) {
    return uint256(
      keccak256(
        abi.encodePacked(
          _nodeKey0,
          _nodeKey1,
          _slot0,
          _slot1
        )
      )
    );
  }
  
  /// @notice Create an EdgeProposal, between the Nodes with the given keys, via their given slots. Simply immediately toggle an edge if both are owned by msg.sender. Will error if they are neither connected nor disconnected.
  /// @param _nodeKey0 The uint256 key of the first Node to connect to/disconnect from the second one.
  /// @param _nodeKey1 The uint256 key of the second Node to connect to/disconnect from the first one.
  /// @param _slot0 The uint8 slot of the first Node to connect/disconnect through.
  /// @param _slot1 The uint8 slot of the second Node to connect/disconnect through.
  /// @param _message The bytes30 arbitrary message from the proposer to the proposee: a human-readable form of the EdgeProposal, aka the "epmess".
  function createEdgeProposal(uint256 _nodeKey0, uint256 _nodeKey1, uint8 _slot0, uint8 _slot1, bytes30 _message) external {
    
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
        
        // Log the edge creation.
        emit EdgeCreated(_nodeKey0, _nodeKey1, _slot0, _slot1, msg.sender, msg.sender);
      }
      else {
        // Disconnect 'em.
        node0.edgeNodeKeys[_slot0] = 0;
        node1.edgeNodeKeys[_slot1] = 0;
        
        // Log the edge deletion.
        emit EdgeDeleted(_nodeKey0, _nodeKey1, _slot0, _slot1, msg.sender, msg.sender);
      }
      return; // Done, in either case.
    }
    
    // Node 1 is not owned by msg.sender, so continue with an actual EdgeProposal.
    uint256 newEdgeProposalKey = edgeProposalKeyFromNodesAndSlots(_nodeKey0, _nodeKey1,  _slot0, _slot1);
    require(
      edgeProposalLookup[newEdgeProposalKey].nodeKey0 == 0,
      "This exact EdgeProposal already exists. You can reject it if you want."
    );
    
    uint256 reverseEdgeProposalKey = edgeProposalKeyFromNodesAndSlots(_nodeKey1, _nodeKey0, _slot1, _slot0);
    require(
      edgeProposalLookup[reverseEdgeProposalKey].nodeKey0 == 0,
      "The reverse of this EdgeProposal already exists. You can either reject or accept it."
    );
    
    // Combine the epmess and the slots into one bytes32.
    bytes32 messageAndSlots = bytes32(_message);
    messageAndSlots |= bytes32(byte(_slot0)) >> 240; // byte 30
    messageAndSlots |= bytes32(byte(_slot1)) >> 248; // byte 31
    
    // Okay, we're clear to actually create the EdgeProposal. Set 3 storage slots: 60k of gas right there!
    edgeProposalLookup[newEdgeProposalKey] = EdgeProposal({
      nodeKey0: _nodeKey0,
      nodeKey1: _nodeKey1,
      messageAndSlots: messageAndSlots
    });
    
    // Log the EdgeProposal creation.
    emit EdgeProposalCreated(newEdgeProposalKey, msg.sender, node1.ownerAddr);
  }
  
  function acceptEdgeProposal(uint256 _edgeProposalKey) external {
    
    EdgeProposal memory edgeProposal = edgeProposalLookup[_edgeProposalKey];
    uint8 slot0 = uint8(edgeProposal.messageAndSlots[30]);
    uint8 slot1 = uint8(edgeProposal.messageAndSlots[31]);
    
    // The EdgeProposal must exist, and you must own the nodeKey1 Node
    Node storage node1 = nodeLookup[edgeProposal.nodeKey1];
    require(
      node1.ownerAddr == msg.sender,
      "You must own the EdgeProposal nodeKey1 Node, or the EdgeProposal might not even exist."
    );
    
    // Note: node0 could well belong to msg.sender depending on Node transactions after the EdgeProposal was created. That's fine.
    Node storage node0 = nodeLookup[edgeProposal.nodeKey0];
    
    require (
      (node0.edgeNodeKeys[slot0] == edgeProposal.nodeKey1 && node1.edgeNodeKeys[slot1] == edgeProposal.nodeKey0)
      || (node0.edgeNodeKeys[slot0] == 0 && node1.edgeNodeKeys[slot1] == 0),
      "The Nodes slots at _nodeKey0 _slot0 and _nodeKey1 _slot1 must be either both connected to each other or both disconnected from any Node."
    );
    
    // Okay, everything checks out - let's do this!
    
    // Since we already confirmed they are in valid configuration, a simple check if one slot is 0 or not is enough to let us know what to do.
    if (node0.edgeNodeKeys[slot0] == 0) {
      // Connect 'em.
      node0.edgeNodeKeys[slot0] = edgeProposal.nodeKey1;
      node1.edgeNodeKeys[slot1] = edgeProposal.nodeKey0;
      
      // Log the edge creation.
      emit EdgeCreated(edgeProposal.nodeKey0, edgeProposal.nodeKey1, slot0, slot1, node0.ownerAddr, node1.ownerAddr);
    }
    else {
      // Disconnect 'em.
      node0.edgeNodeKeys[slot0] = 0;
      node1.edgeNodeKeys[slot1] = 0;
      
      // Log the edge deletion.
      emit EdgeDeleted(edgeProposal.nodeKey0, edgeProposal.nodeKey1, slot0, slot1, node0.ownerAddr, node1.ownerAddr);
    }
    
    // Delete teh EdgeProposal from the lookup.
    delete edgeProposalLookup[_edgeProposalKey];
    
    // Log the EdgeProposal acceptance.
    emit EdgeProposalAccepted(_edgeProposalKey, msg.sender, node0.ownerAddr);
    
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
    
    // Log the EdgeProposal rejection.
    emit EdgeProposalRejected(_edgeProposalKey, msg.sender, nodeOwnerAddrs[nodeOwnerAddrs[0] == msg.sender ? 1 : 0]);
  }
  
  /// @notice Get the EdgeProposal at the given key.
  /// @param _edgeProposalKey The uint256 key of the desired EdgeProposal.
  /// @return nodeKey0 The uint256 key of the proposer's Node.
  /// @return nodeKey1 The uint256 key of the proposee's Node.
  /// @return slot0 The uint8 slot in the proposer's Node that would be connected/disconnected.
  /// @return slot1 The uint8 slot in the proposee's Node that would be connected/disconnected.
  /// @return valid A bool indicating whether this EdgeProposal is still valid.
  /// @return connect A bool indicating whether this edgeProposal would connect (true) or disconnect the proposed Nodes. false if EdgeProposal is invalid.
  function getEdgeProposal(uint256 _edgeProposalKey) external view returns (
    uint256 nodeKey0,
    uint256 nodeKey1,
    bytes30 message,
    uint8 slot0,
    uint8 slot1,
    bool valid,
    bool connect
  ) {
    EdgeProposal memory edgeProposal = edgeProposalLookup[_edgeProposalKey];
    
    // Make sure it's real.
    require(
      edgeProposal.nodeKey0 != 0,
      "The EdgeProposal at _edgeProposalKey must exist."
    );
    
    // Return its set values.
    nodeKey0 = edgeProposal.nodeKey0;
    nodeKey1 = edgeProposal.nodeKey1;
    message = bytes30(edgeProposal.messageAndSlots);
    slot0 = uint8(edgeProposal.messageAndSlots[30]);
    slot1 = uint8(edgeProposal.messageAndSlots[31]);
    
    // Also check validity and, if valid, whether the EdgeProposal would connect or disconnect the Nodes.
    if (uint(nodeLookup[nodeKey0].ownerAddr) == 0 || uint(nodeLookup[nodeKey1].ownerAddr) == 0) {
      // One or both of the Nodes were since deleted.
      valid = false;
      connect = false;
    }
    else {
      // Nodes are valid - check the nodeKeys in their slots.
      uint256 slotKey0 = nodeLookup[nodeKey0].edgeNodeKeys[slot0];
      uint256 slotKey1 = nodeLookup[nodeKey1].edgeNodeKeys[slot1];
      
      if (slotKey0 == nodeKey1 && slotKey1 == nodeKey0) {
        valid = true;
        connect = false;
      }
      else if (slotKey0 == 0 && slotKey1 == 0) {
        valid = true;
        connect = true;
      }
      else {
        // One or both of the slots were since
        valid = false;
        connect = false;
      }
    }
  }
}
