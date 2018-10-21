pragma solidity ^0.4.24;

/// @title The Interweave Network graph contract.
/// @author interweaver
/// @notice This is still a development version, but for now, is intended to represent a full graph.
contract InterweaveGraph {
    
  /// @notice Node struct represents a node in the graph (a place), with owner, representation with format, and connections to other Nodes.
  struct Node {
    bytes32[2] ipfs;
    uint64 format;
    uint64 ownerNodesIndex; // Supports efficient deleting of nodes.
    address[] halfEdgeAddrs;
  }
  
  /// @notice HalfEdge struct represents half of an edge in the graph, with the Node it belongs to, representation with implicit format, and connection to another HalfEdge.
  struct HalfEdge {
    address nodeAddr;
    address otherHalfEdgeAddr;
    bytes32[2] ipfs; // format = format of node
  }
  
  /// @notice Owner struct represents the set of Nodes and EdgeProposals belonging to a particular Ethereum address.
  struct Owner {
    address[] nodeAddrs;
    address[] edgeProposalAddrs;
  }
  
  /// @notice A new Node was created on the graph.
  /// @param nodeAddr The address of the created Node.
  event NodeCreated(address nodeAddr);
  
  /// @notice A Node was deleted from the graph.
  /// @param nodeAddr The address of the deleted Node.
  event NodeDeleted(address nodeAddr);
  
  /// @notice A HalfEdge was created on the graph.
  /// @param halfEdgeAddr The address of the created HalfEdge.
  event HalfEdgeCreated(address halfEdgeAddr);
  
  /// @notice A HalfEdge was deleted from the graph.
  /// @param halfEdgeAddr The address of the deleted HalfEdge.
  event HalfEdgeDeleted(address halfEdgeAddr);
  
  /// @notice A Mapping allowing lookup of Nodes by their addresses.
  /// @dev Node addresses = kekkac(owner, ipfs)
  mapping (address => Node) internal nodeLookup;
  
  /// @notice A mapping allowing lookup of HalfEdges by their addresses.
  /// @dev HalfEdge addresses = kekkac(owner, ipfs)
  mapping (address => HalfEdge) internal halfEdgeLookup;
  
  /// @notice A mapping allowing lookup of Owners by their (Ethereum) addresses.
  mapping (address => Owner) internal ownerLookup;
  
  /// @notice Create a new Node on the graph.
  /// @param _ipfs The IPFS hash string of the Node's content file, in two bytes32. Must be unique for this address's Nodes in the graph.
  /// @param _format The format identifier of the Node's content. Must match with the file at the given IPFS hash, or viewers won't be able to interpret the content.
  /// @return The Address of the new Node.
  function createNode(bytes32[2] _ipfs, uint64 _format) external returns (address) {
    
    // Generate Node's address from the msg.sender + the IPFS hash.
    address newNodeAddress = address(keccak256(abi.encodePacked(
      msg.sender,
      _ipfs[0],
      _ipfs[1]
    )));
    
    // There must not already be a node at that address with the same owner.
    // Your maze of twisty little passages must *not* be all alike.
    require(
        uint(nodeLookup[newNodeAddress].ipfs.length) == 0,
        "You already own a node with _ipfs!"
    );
    
    // Instantiate and save the new Node at its address.
    nodeLookup[newNodeAddress] = Node({
        ipfs: _ipfs,
        format: _format,
        ownerNodesIndex: uint64(ownerLookup[msg.sender].nodeAddrs.length), // We're gonna push it onto the end.
        halfEdgeAddrs: new address[](0)
    });
    
    // Also save the new Node's address in its Owner's list of nodes (don't need to create it)
    ownerLookup[msg.sender].nodeAddrs.push(newNodeAddress);
    
    // Log the Node creation.
    emit NodeCreated(newNodeAddress);
    
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
      _nodeAddr == address(keccak256(abi.encodePacked(msg.sender, node.ipfs[0], node.ipfs[1]))),
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
    uint64 index = node.ownerNodesIndex;
    uint64 lastIndex = uint64(nodeAddrs.length - 1);
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
    emit NodeDeleted(_nodeAddr);
  }
  
  /// @notice Get how many Nodes are owned by the sender.
  /// @return How many Nodes they own.
  function getNodeCount() public view returns (uint) {
    return ownerLookup[msg.sender].nodeAddrs.length;
  }
  
  /// @notice Get the address of the Node belonging to the sender at the given index in the sender's array of Nodes.
  /// @param _index A uint containing the index of the Node to get (must be less than the number returned by getOwnerNodeCount).
  /// @return The address of the sender's Node at the index.
  function getNodeAddrByIndex(uint _index) public view returns (address) {
    
    // Avoid index out of bounds exceptions.
    require(
      _index < ownerLookup[msg.sender].nodeAddrs.length,
      "The index supplied was >= the number of the Nodes belonging to the Owner."
    );
    
    // Do the lookup and return.
    return ownerLookup[msg.sender].nodeAddrs[_index];
  }
  
  /// @notice Create a new HalfEdge on the graph.
  /// @param _nodeAddr The address of the Node to which this HalfEdge will belong.
  /// @param _ipfs A bytes32[2] containing the HalfEdge's IPFS hash. Must be unique for the Owner's HalfEdges in the graph. Content must have the same format as the Node.
  /// @return The address of the new HalfEdge.
  function createHalfEdge(address _nodeAddr, bytes32[2] _ipfs) external returns (address) {
    
    // Make sure msg.sender owns the Node.
    Node memory node = nodeLookup[_nodeAddr];
    require(
      _nodeAddr == address(keccak256(abi.encodePacked(msg.sender, node.ipfs[0], node.ipfs[1]))),
      "You must own this Node to be able to add a HalfEdge to it."
    );
    
    // Make sure the Node doesn't already have 6 HalfEdges.
    require(
      node.halfEdgeAddrs.length < 6,
      "You cannot have more than 6 HalfEdges on one Node."
    );
    
    // Make sure _ipfs isn't already used for a HalfEdge by this Owner.
    // Your paths connecting the maze of twisty little passages must *not* be all alike.
    address newHalfEdgeAddr = address(keccak256(abi.encodePacked(
      msg.sender,
      _ipfs[0],
      _ipfs[1]
    )));
    require(
      uint(halfEdgeLookup[newHalfEdgeAddr].nodeAddr) == 0,
      "You already own a HalfEdge with _ipfs!"
    );
    
    // Instantiate and save the new HalfEdge at its address.
    halfEdgeLookup[newHalfEdgeAddr] = HalfEdge({
      nodeAddr: _nodeAddr,
      ipfs: _ipfs,
      otherHalfEdgeAddr: address(0)
    });
    
    // Add newHalfEdgeAddr to its Node's halfEdgeAddrs. // Note: make sure this 'sticks'... used to be 'node.halfEdgeAddrs...' with 'node' as 'storage' above.
    nodeLookup[_nodeAddr].halfEdgeAddrs.push(newHalfEdgeAddr);
    
    // Log the creation.
    emit HalfEdgeCreated(newHalfEdgeAddr);
    
    // Finally, hand back the new HalfEdge's address to the caller.
    return newHalfEdgeAddr;
  }
  
  /// @notice Delete a HalfEdge from the graph.
  /// @param _halfEdgeAddr The address of the HalfEdge to delete from the graph.
  function deleteHalfEdge(address _halfEdgeAddr) external {
    
    // Get the HalfEdge being deleted. Aren't changing it, but need it a couple of times, so memory.
    HalfEdge memory halfEdge = halfEdgeLookup[_halfEdgeAddr];
    
    // Make sure the HalfEdge exists.
    require(
      uint(halfEdge.nodeAddr) != 0,
      "The HalfEdge must exist in order to be deleted."
    );
    
    
    // Make sure the HalfEdge belongs to msg.sender.
    require (
      _halfEdgeAddr == address(keccak256(abi.encodePacked(msg.sender, halfEdge.ipfs[0], halfEdge.ipfs[1]))),
      "You must own this HalfEdge to be able to delete it."
    );
    
    // Make sure the HalfEdge isn't connected to another.
    require (
      uint(halfEdge.otherHalfEdgeAddr) == 0,
      "You must disconnect this HalfEdge from its other half before deleting it."
    );
    
    // Get the Node of the HalfEdge being deleted. Will be changing its halfEdgeAddrs array, so storage. (unless halfEdgeAddrs storage later makes this unneeded???)
    Node storage node = nodeLookup[halfEdge.nodeAddr];
    
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
    emit HalfEdgeDeleted(_halfEdgeAddr);
  }
  
  /// @notice Get all the relevant data for the Node with the given address: ipfs, format, whether msg.sender owns the Node, and list of HalfEdge addresses, with 0x0 for empty HalfEdge slots.
  /// @param _nodeAddr The address of the Node to get the HalfEdge addresses for.
  /// @return ipfs A bytes32[2] containing the IPFS hash for the Node.
  /// @return format A uint64 containing the Node's format.
  /// @return senderIsOwner A bool indicating if the sender owns this Node.
  /// @return halfEdgeAddrs The addresses of each of the HalfEdges, or 0x0 if that slot is currently empty.
  /// @dev Callers are responsible for noticing empty HalfEdge addresses. Someday when dynamic return lengths are possible, this will just return the set of HalfEdge addresses without empty slots.
  function getNode(address _nodeAddr) external view returns (
    bytes32[2] ipfs,
    uint64 format,
    bool senderIsOwner,
    address[6] halfEdgeAddrs
  ) {
    
    // Look up the Node in question.
    Node memory node = nodeLookup[_nodeAddr];
    
    // Make sure it exists.
    require(
      uint(node.ipfs.length) == 2,
      "Node does not exist."
    );
    
    ipfs = node.ipfs;
    format = node.format;
    if (_nodeAddr == address(keccak256(abi.encodePacked(msg.sender, ipfs[0], ipfs[1])))) {
      senderIsOwner = true;
    }
    
    // Count how many halfEdgeAddrs it has.
    uint8 len = uint8(node.halfEdgeAddrs.length);
    
    // Set our return values: the addresss of each of the up-to-six HalfEdges, leaving it at 0x0 if beyond the current number of HalfEdges.
    for (uint8 i = 0; i < len; i++) {
      halfEdgeAddrs[i] = node.halfEdgeAddrs[i];
    }
  }
  
  /// @notice Get the ipfs hash, format, and node address for the HalfEdge with this address, and for its otherHalfEdge if it exists, too.
  /// @return nodeAddr The address of the HalfEdge's Node.
  /// @return ipfs A bytes32[2] containing the HalfEdge's IPFS hash.
  /// @return format A uint64 containing the HalfEdge's format (from its Node)
  /// @return connected A bool indicating if the HalfEdge is connected to another one.
  /// @return otherNodeAddr The address of the other HalfEdge's Node, if connected (or 0x0 if not).
  /// @return otherIpfs A bytes32[2] containing the IPFS hash of the other HalfEdge, if connected (or an array of 0s if not).
  /// @return otherFormat A uint64 containing the format of the other HalfEdge (from its Node), if connected (or 0 if not).
  function getEdge(address _halfEdgeAddr) external view returns (
    address nodeAddr,
    bytes32[2] ipfs,
    uint64 format,
    bool connected,
    address otherNodeAddr,
    bytes32[2] otherIpfs,
    uint64 otherFormat
  ) {
    
    // Grab the HalfEdge.
    HalfEdge memory halfEdge = halfEdgeLookup[_halfEdgeAddr];
    
    // Make sure it exists.
    require(
      uint(halfEdge.nodeAddr) != 0,
      "HalfEdge does not exist."
    );
    
    // Get this HalfEdge's data.
    nodeAddr = halfEdge.nodeAddr;
    ipfs = halfEdge.ipfs;
    format = nodeLookup[halfEdge.nodeAddr].format;
    
    // Check for and, if it exists, get, the otherHalfEdge's data.
    if (uint(halfEdge.otherHalfEdgeAddr) != 0) {
      HalfEdge memory otherHalfEdge = halfEdgeLookup[halfEdge.otherHalfEdgeAddr];
      
      // If otherHalfEdge doesn't exist, despite otherHalfEdgeAddr not being 0, we have an invariant failure which we may as well check for here.
      assert(uint(otherHalfEdge.nodeAddr) != 0);
      
      connected = true;
      otherNodeAddr = otherHalfEdge.nodeAddr;
      otherIpfs = otherHalfEdge.ipfs;
      otherFormat = nodeLookup[otherHalfEdge.nodeAddr].format;
    }
    // Else, just return the 0-initialized values.
  }
}
