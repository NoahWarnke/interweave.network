pragma solidity ^0.4.25;

/// @title The Interweave Network graph contract.
/// @author interweaver
/// @notice This is still a development version, but for now, is intended to represent a full graph.
contract InterweaveGraph {
    
  /// @notice Node struct represents a node in the graph (a place), with owner, representation with format, and connections to other Nodes.
  struct Node {
    address ownerAddr;
    string ipfs;
    uint32 format;
    uint32 ownerNodesIndex; // Supports efficient deleting of nodes. Don't create more than 4 billion nodes, yo.
    address[] halfEdgeAddrs;
  }
  
  /// @notice HalfEdge struct represents half of an edge in the graph, with the Node it belongs to, representation with implicit format, and connection to another HalfEdge.
  struct HalfEdge {
    address nodeAddr;
    string ipfs; // format = format of node
    address otherHalfEdgeAddr;
  }
  
  /// @notice EdgeProposal struct represents a proposal to connect or disconnect two Nodes via two HalfEdges belonging to them. halfEdgeAddr0 belongs to the proposer.
  struct EdgeProposal {
    address halfEdgeAddr0;
    address halfEdgeAddr1;
  }
  
  /// @notice Owner struct represents the set of Nodes and EdgeProposals belonging to a particular Ethereum address.
  struct Owner {
    address[] nodeAddrs;
    address[] edgeProposalAddrs;
  }
  
  /// @notice A new Node was created on the graph.
  /// @param nodeAddr The address of the created Node.
  /// @param ownerAddr The Ethereum address of the created Node's Owner.
  event NodeCreated(address nodeAddr, address ownerAddr);
  
  /// @notice A Node was deleted from the graph.
  /// @param nodeAddr The address of the deleted Node.
  /// @param ownerAddr The Ethereum address of the deleted Node's Owner.
  event NodeDeleted(address nodeAddr, address ownerAddr);
  
  /// @notice A HalfEdge was created on the graph.
  /// @param halfEdgeAddr The address of the created HalfEdge.
  /// @param ownerAddr The Ethereum address of the created HalfEdge's Owner.
  event HalfEdgeCreated(address halfEdgeAddr, address ownerAddr);
  
  /// @notice A HalfEdge was deleted from the graph.
  /// @param halfEdgeAddr The address of the deleted HalfEdge.
  /// @param ownerAddr The Ethereum address of the deleted HalfEdge's Owner.
  event HalfEdgeDeleted(address halfEdgeAddr, address ownerAddr);
  
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
  
  /// @notice A Mapping allowing lookup of Nodes by their addresses.
  /// @dev Node addresses = kekkac(ipfsHash)
  mapping (address => Node) public nodeLookup;
  
  /// @notice A mapping allowing lookup of HalfEdges by their addresses.
  /// @dev HalfEdge addresses = kekkac(ipfsHash)
  mapping (address => HalfEdge) public halfEdgeLookup;
  
  /// @notice A mapping allowing lookup of EdgeProposals by their addresses.
  /// @dev EdgeProposal addresses = kekkac(halfEdgeAddr0, halfEdgeAddr1)
  mapping (address => EdgeProposal) public edgeProposalLookup;
  
  /// @notice A mapping allowing lookup of Owners by their (Ethereum) addresses.
  mapping (address => Owner) private ownerLookup;
  
  /// @notice Create a new Node on the graph.
  /// @param _ipfs The IPFS hash string of the Node's content file. Must be unique for Nodes in the graph.
  /// @param _format The format identifier of the Node's content. Must match with the file at the given IPFS hash, or viewers won't be able to interpret the content.
  /// @return The Address of the new Node.
  function createNode(string _ipfs, uint32 _format) external returns (address) {
    
    // Make sure _ipfs isn't too small or too huge. Arbitrary, but allows standard Qm+ 46-char hashes.
    uint hashLength = bytes(_ipfs).length;
    require(
      hashLength >= 32 && hashLength <= 64,
      "_ipfs must be between 32 and 64 characters long."
    );
    
    // Generate Node's address from the IPFS hash.
    address newNodeAddress = address(keccak256(abi.encodePacked(_ipfs)));
    
    // There must not already be a node at that address.
    // The maze of twisty little passages must *not* be all alike.
    require(
        uint(nodeLookup[newNodeAddress].ownerAddr) == 0,
        "A node with _ipfs already exists!"
    );
    
    // Instantiate and save the new Node at its address.
    nodeLookup[newNodeAddress] = Node({
        ownerAddr: msg.sender,
        ipfs: _ipfs,
        format: _format,
        ownerNodesIndex: uint32(ownerLookup[msg.sender].nodeAddrs.length), // We're gonna push it onto the end.
        halfEdgeAddrs: new address[](0)
    });
    
    // Also save the new Node's address in its Owner's list of nodes (don't need to create it)
    ownerLookup[msg.sender].nodeAddrs.push(newNodeAddress);
    
    // Log the Node creation.
    emit NodeCreated(newNodeAddress, msg.sender);
    
    // Finally, hand back the new Node's address to the caller.
    return newNodeAddress;
  }
  
  /// @notice Delete a Node from the graph.
  /// @param _nodeAddr The address of the Node to delete from the graph.
  function deleteNode(address _nodeAddr) external {
    
    // Get the Node being deleted.
    Node memory node = nodeLookup[_nodeAddr];
    
    // Make sure the Node exists and belongs to msg.sender (can do both checks at once).
    require(
      node.ownerAddr == msg.sender,
      "You must own this Node to be able to delete it."
    );
    
    // Make sure the Node is not connected to any others.
    for (uint8 i = 0; i < node.halfEdgeAddrs.length; i++) {
      require(
        uint(halfEdgeLookup[node.halfEdgeAddrs[i]].otherHalfEdgeAddr) == 0,
        "You must disconnect this Node from all other Nodes before deleting it."
      );
    }
    
    // Delete the Node's up-to-6 HalfEdges (which we just confirmed were not connected to anything) from the halfEdgeLookup mapping.
    // The only other references to them should be in the about-to-be-deleted Node and any about-to-be-invalidated EdgeProposals.
    for (i = 0; i < node.halfEdgeAddrs.length; i++) {
      delete halfEdgeLookup[node.halfEdgeAddrs[i]];
    }
    
    // Delete the Node from its Owner's nodeAddrs array:
    // ...Get that array as storage because we'll be using it several times, modifying it, and want the changes to stick.
    address[] storage nodeAddrs = ownerLookup[msg.sender].nodeAddrs;
    
    // ...If the Node is not the last element in the array, swap the last element over top of it.
    uint32 index = node.ownerNodesIndex;
    uint32 lastIndex = uint32(nodeAddrs.length - 1);
    if (index < lastIndex) {
      nodeAddrs[index] = nodeAddrs[lastIndex];
      nodeLookup[nodeAddrs[index]].ownerNodesIndex = index; // Need to update that formerly-last Node's ownerNodesIndex too.
    }
    
    // ...Either way, then delete the last element and shrink the array.
    delete nodeAddrs[lastIndex];
    nodeAddrs.length--;
    
    // Delete the Node from the nodeLookup mapping.
    delete nodeLookup[_nodeAddr];
    
    // Log the Node deletion.
    emit NodeDeleted(_nodeAddr, msg.sender);
  }
  
  /// @notice Get how many Nodes are owned by the Owner with the given address.
  /// @param _ownerAddr The address of the Owner.
  /// @return How many Nodes they own.
  function getOwnerNodeCount(address _ownerAddr) public view returns (uint) {
    return ownerLookup[_ownerAddr].nodeAddrs.length;
  }
  
  /// @notice Get the address of the Node belonging to the Owner with the given address at the given index in the Owner's array of Nodes.
  /// @param _ownerAddr The address of the Owner.
  /// @param _index The index of the Node to get (must be less than the number returned by getOwnerNodeCount).
  /// @return The address of the Owner's Node at the index.
  function getOwnerNodeAddrByIndex(address _ownerAddr, uint _index) public view returns (address) {
    
    // Avoid index out of bounds exceptions.
    require(
      _index < ownerLookup[_ownerAddr].nodeAddrs.length,
      "The index supplied was >= the number of your nodes."
    );
    
    // Do the lookup and return.
    return ownerLookup[_ownerAddr].nodeAddrs[_index];
  }
  
  /// @notice Create a new HalfEdge on the graph.
  /// @param _nodeAddr The address of the Node to which this HalfEdge will belong.
  /// @param _ipfs The IPFS hash string of the HalfEdge's content file. Must be unique for HalfEdges in the graph. Content must have the same format as the Node.
  /// @return The address of the new HalfEdge.
  function createHalfEdge(address _nodeAddr, string _ipfs) external returns (address) {
    
    // Make sure msg.sender owns the Node.
    Node storage node = nodeLookup[_nodeAddr];
    require(
      msg.sender == node.ownerAddr,
      "You must own this Node to be able to add a HalfEdge to it."
    );
    
    // Make sure the Node doesn't already have 6 HalfEdges.
    require(
      node.halfEdgeAddrs.length < 6,
      "You cannot have more than 6 HalfEdges on one Node."
    );
    
    // Make sure _ipfs isn't too small or too huge. Arbitrary, but allows standard Qm+ 46-char hashes.
    uint hashLength = bytes(_ipfs).length;
    require(
      hashLength >= 32 && hashLength <= 64,
      "_ipfs must be between 32 and 64 characters long."
    );
    
    // Make sure _ipfs isn't already used for a HalfEdge.
    // The paths connecting the maze of twisty little passages must *not* be all alike.
    address newHalfEdgeAddr = address(keccak256(abi.encodePacked(_ipfs)));
    require(
      uint(halfEdgeLookup[newHalfEdgeAddr].nodeAddr) == 0,
      "A HalfEdge with _ipfs already exists!"
    );
    
    // Instantiate and save the new HalfEdge at its address.
    halfEdgeLookup[newHalfEdgeAddr] = HalfEdge({
      nodeAddr: _nodeAddr,
      ipfs: _ipfs,
      otherHalfEdgeAddr: address(0)
    });
    
    // Add newHalfEdgeAddr to its Node's halfEdgeAddrs.
    node.halfEdgeAddrs.push(newHalfEdgeAddr);
    
    // Log the creation.
    emit HalfEdgeCreated(newHalfEdgeAddr, msg.sender);
    
    // Finally, hand back the new HalfEdge's address to the caller.
    return newHalfEdgeAddr;
  }
  
  /// @notice Delete a HalfEdge from the graph.
  /// @param _halfEdgeAddr The address of the HalfEdge to delete from the graph.
  function deleteHalfEdge(address _halfEdgeAddr) external {
    
    // Get the HalfEdge being deleted. Aren't changing it, but need it a couple of times, so memory.
    HalfEdge memory halfEdge = halfEdgeLookup[_halfEdgeAddr];
    
    // Get the Node of the HalfEdge being deleted. Will be changing its halfEdgeAddrs array, so storage. (unless halfEdgeAddrs storage later makes this unneeded???)
    Node storage node = nodeLookup[halfEdge.nodeAddr];
    
    // Make sure the HalfEdge exists and belongs to msg.sender (can do both checks at once).
    // Side note: If the HalfEdge doesn't exist, nodeLookup[0x0] will only ever contain 0s unless someone discovers an IPFS hash that hashes to 0x0 :)
    require (
      node.ownerAddr == msg.sender,
      "You must own this HalfEdge to be able to delete it."
    );
    
    // Make sure the HalfEdge isn't connected to another.
    require (
      uint(halfEdge.otherHalfEdgeAddr) == 0,
      "You must disconnect this HalfEdge from its other half before deleting it."
    );
    
    // Delete the HalfEdge from its Node's halfEdgeAddrs array:
    // ...Get that array as storage because we'll be using it several times, modifying it, and want the changes to stick.
    address[] storage halfEdgeAddrs = node.halfEdgeAddrs;
    
    // ...Check invariant: Nodes always have <= 6 HalfEdges.
    assert(halfEdgeAddrs.length <= 6);
    
    // ...Iterate (up to 6 times) to find index of _halfEdgeAddr in halfEdgeAddrs.
    uint8 index = 0;
    for (uint8 i = 0; i < halfEdgeAddrs.length; i++) {
      if (halfEdgeAddrs[i] == _halfEdgeAddr) {
        index = i;
        i = uint8(halfEdgeAddrs.length); // cut out early
      }
    }
    
    // ...If the HalfEdge is not the last element in the array, swap the last element over top of it.
    uint8 lastIndex = uint8(halfEdgeAddrs.length - 1);
    if (index < lastIndex) {
      halfEdgeAddrs[index] = halfEdgeAddrs[lastIndex];
    }
    
    // ...Either way, then delete the last element and shrink the array.
    delete halfEdgeAddrs[lastIndex];
    halfEdgeAddrs.length--;
    
    // Delete the HalfEdge from the halfEdgeLookup mapping.
    delete halfEdgeLookup[_halfEdgeAddr];
    
    // Log the deletion.
    emit HalfEdgeDeleted(_halfEdgeAddr, node.ownerAddr);
  }
  
  /// @notice Get all the addresses of the HalfEdge belonging to the Node with the given address. Returns 0x0 for empty HalfEdge slots.
  /// @param _nodeAddr The address of the Node to get the HalfEdge addresses for.
  /// @return halfEdgeAddr0 The address of the 0th HalfEdge, or 0x0 if < 1 HalfEdges.
  /// @return halfEdgeAddr1 The address of the 1st HalfEdge, or 0x0 if < 2 HalfEdges.
  /// @return halfEdgeAddr2 The address of the 2nd HalfEdge, or 0x0 if < 3 HalfEdges.
  /// @return halfEdgeAddr3 The address of the 3rd HalfEdge, or 0x0 if < 4 HalfEdges.
  /// @return halfEdgeAddr4 The address of the 4th HalfEdge, or 0x0 if < 5 HalfEdges.
  /// @return halfEdgeAddr5 The address of the 5th HalfEdge, or 0x0 if < 6 HalfEdges.
  /// @dev Callers are responsible for noticing empty HalfEdge addresses. Someday when dynamic return lengths are possible, this will just return the set of HalfEdge addresses without empty slots...
  function getNodeHalfEdgeAddrs(address _nodeAddr) external view returns (
    address halfEdgeAddr0,
    address halfEdgeAddr1,
    address halfEdgeAddr2,
    address halfEdgeAddr3,
    address halfEdgeAddr4,
    address halfEdgeAddr5
  ) {
    
    // Look up the Node in question.
    Node memory node = nodeLookup[_nodeAddr];
    
    // Make sure it exists.
    require(
        uint(node.ownerAddr) != 0,
        "Node does not exist."
    );
    
    // Count how many halfEdgeAddrs it has.
    uint8 len = uint8(node.halfEdgeAddrs.length);
    
    // Set our return values: the addresss of each of the up-to-six HalfEdges, or 0x0 if that slot is empty.
    halfEdgeAddr0 = len > 0 ? node.halfEdgeAddrs[0] : address(0);
    halfEdgeAddr1 = len > 1 ? node.halfEdgeAddrs[1] : address(0);
    halfEdgeAddr2 = len > 2 ? node.halfEdgeAddrs[2] : address(0);
    halfEdgeAddr3 = len > 3 ? node.halfEdgeAddrs[3] : address(0);
    halfEdgeAddr4 = len > 4 ? node.halfEdgeAddrs[4] : address(0);
    halfEdgeAddr5 = len > 5 ? node.halfEdgeAddrs[5] : address(0);
  }
  
  function createEdgeProposal(address _halfEdgeAddr0, address _halfEdgeAddr1) external returns (address) { }
  
  function acceptEdgeProposal(address _edgeProposalAddr) external { }
  
  function rejectEdgeProposal(address _edgeProposalAddr) external { }
  
  function getOwnerEdgeProposalCount(address _ownerAddr) public view returns (uint) { }
  
  function getOwnerEdgeProposalAddrByIndex(address _ownerAddr, uint _index) public view returns (address) { }
}
