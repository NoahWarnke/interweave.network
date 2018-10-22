pragma solidity ^0.4.24;

/// @title The Interweave Network graph contract.
/// @author interweaver
/// @notice This is still a development version, but for now, is intended to represent a full graph.
contract InterweaveGraph {
    
  /// @notice Node struct represents a node in the graph (a place), with owner, representation with format, and connections to other Nodes.
  struct Node {
    address owner;
    bytes32[2] ipfs;
    uint64 format;
    uint64 ownerNodesIndex; // Supports efficient deleting of nodes.
    uint256[] halfEdgeKeys;
  }
  
  /// @notice HalfEdge struct represents half of an edge in the graph, with the Node it belongs to, representation with implicit format, and connection to another HalfEdge.
  struct HalfEdge {
    uint256 nodeKey;
    uint256 otherHalfEdgeKey;
    bytes32[2] ipfs; // format = format of node
  }
  
  /// @notice Owner struct represents the set of Nodes and EdgeProposals belonging to a particular Ethereum address.
  struct Owner {
    uint256[] nodeKeys;
    uint256[] edgeProposalKeys;
  }
  
  /// @notice A new Node was created on the graph.
  /// @param nodeKey The key of the created Node.
  /// @param ownerAddr The address of the new Node's Owner.
  event NodeCreated(uint256 nodeKey, address indexed ownerAddr);
  
  /// @notice A Node was deleted from the graph.
  /// @param nodeKey The key of the deleted Node.
  /// @param ownerAddr The address of the old Node's Owner.
  event NodeDeleted(uint256 nodeKey, address indexed ownerAddr);
  
  /// @notice A HalfEdge was created on the graph.
  /// @param halfEdgeKey The key of the created HalfEdge.
  /// @param ownerAddr The address of the new HalfEdge's Owner.
  event HalfEdgeCreated(uint256 halfEdgeKey, address indexed ownerAddr);
  
  /// @notice A HalfEdge was deleted from the graph.
  /// @param halfEdgeKey The key of the deleted HalfEdge.
  /// @param ownerAddr The address of the deleted HalfEdge's Owner.
  event HalfEdgeDeleted(uint256 halfEdgeKey, address indexed ownerAddr);
  
  /// @notice A Mapping allowing lookup of Nodes by their keys.
  /// @dev Node keys = uint256(kekkac(ipfs))
  mapping (uint256 => Node) internal nodeLookup;
  
  /// @notice A mapping allowing lookup of HalfEdges by their keys.
  /// @dev HalfEdge keys = uint256(kekkac(ipfs))
  mapping (uint256 => HalfEdge) internal halfEdgeLookup;
  
  /// @notice A mapping allowing lookup of Owners by their (Ethereum) addresses.
  mapping (address => Owner) internal ownerLookup;
  
  /// @notice A function to generate a unique key for a Node or HalfEdge from a given IPFS hash.
  /// @param _ipfs A bytes32[2] to use to generate the new key.
  /// @return A uint256 key.
  function keyFromIpfs(bytes32[2] _ipfs) public pure returns (uint256) {
    return uint256(
      keccak256(
        abi.encodePacked(
          _ipfs[0],
          _ipfs[1]
        )
      )
    );
  }
  
  /// @notice Create a new Node on the graph.
  /// @param _ipfs The IPFS hash string of the Node's content file, in two bytes32. Must be unique across all Nodes in the graph.
  /// @param _format The format identifier of the Node's content. Must match with the file at the given IPFS hash, or viewers won't be able to interpret the content.
  /// @dev If the caller wants to know the key of their new Node, they can always call keyFromIpfs on their IPFS hash, before or after Node creation (assuming it doesn't fail.)
  function createNode(bytes32[2] _ipfs, uint64 _format) external {
    
    // Make sure there's something other than 0 in the first chunk of the ipfs hash.
    require(
      uint(_ipfs[0]) != 0,
      "_ipfs[0] was empty!"
    );
    
    // Generate Node's key.
    uint256 newNodeKey = keyFromIpfs(_ipfs);
    
    // There must not already be a Node at that key`.
    // The maze of twisty little passages must *not* be all alike.
    require(
      uint(nodeLookup[newNodeKey].ipfs[0]) == 0,
      "A Node with _ipfs already exists!"
    );
    
    // Instantiate and save the new Node at its key.
    nodeLookup[newNodeKey] = Node({
      owner: msg.sender,
      ipfs: _ipfs,
      format: _format,
      ownerNodesIndex: uint64(ownerLookup[msg.sender].nodeKeys.length), // We're gonna push it onto the end.
      halfEdgeKeys: new uint256[](0)
    });
    
    // Also save the new Node's key in its Owner's list of Node keys (don't need to create the Owner).
    ownerLookup[msg.sender].nodeKeys.push(newNodeKey);
    
    // Log the Node creation.
    emit NodeCreated(newNodeKey, msg.sender);
  }
  
  /// @notice Delete a Node from the graph.
  /// @param _nodeKey The key of the Node to delete from the graph.
  function deleteNode(uint256 _nodeKey) external {
    
    // Get the Node being deleted.
    Node memory node = nodeLookup[_nodeKey];
    
    // Make sure the Node exists and belongs to msg.sender (can do both checks at once, since if node doesn't exist, node.owner = 0x0).
    require(
      msg.sender == node.owner,
      "You must own this Node to be able to delete it."
    );
    
    // Make sure the Node is not connected to any others.
    for (uint8 i = 0; i < node.halfEdgeKeys.length; i++) {
      require(
        uint(halfEdgeLookup[node.halfEdgeKeys[i]].otherHalfEdgeKey) == 0,
        "You must disconnect this Node from all other Nodes before deleting it."
      );
    }
    
    // Delete the Node's up-to-6 HalfEdges (which we just confirmed were not connected to anything) from the halfEdgeLookup mapping.
    // The only other references to them should be in the about-to-be-deleted Node and any about-to-be-invalidated EdgeProposals.
    for (i = 0; i < node.halfEdgeKeys.length; i++) {
      delete halfEdgeLookup[node.halfEdgeKeys[i]];
    }
    
    // Delete the Node from its Owner's nodeKeys array:
    // ...Get that array as storage because we'll be using it several times, modifying it, and want the changes to stick.
    uint256[] storage nodeKeys = ownerLookup[msg.sender].nodeKeys;
    
    // ...If the Node is not the last element in the array, swap the last element over top of it.
    uint64 index = node.ownerNodesIndex;
    uint64 lastIndex = uint64(nodeKeys.length - 1);
    if (index < lastIndex) {
      nodeKeys[index] = nodeKeys[lastIndex];
      nodeLookup[nodeKeys[index]].ownerNodesIndex = index; // Need to update that formerly-last Node's ownerNodesIndex too.
    }
    
    // ...Either way, then delete the last element and shrink the array.
    delete nodeKeys[lastIndex];
    nodeKeys.length--;
    
    // Delete the Node's key from the nodeLookup mapping.
    delete nodeLookup[_nodeKey];
    
    // Log the Node deletion.
    emit NodeDeleted(_nodeKey, msg.sender);
  }
  
  /// @notice Get how many Nodes are owned by the sender.
  /// @return A uint256 containing how many Nodes the sender owns.
  function getSenderNodeCount() public view returns (uint256) {
    return ownerLookup[msg.sender].nodeKeys.length;
  }
  
  /// @notice Get the key of the Node belonging to the sender at the given index in the sender's array of Nodes.
  /// @param _index A uint256 containing the index of the Node to get (must be less than the number returned by getOwnerNodeCount).
  /// @return A uint256 of the sender's Node key at the index.
  function getSenderNodeKeyByIndex(uint256 _index) public view returns (uint256) {
    
    // Avoid index out of bounds exceptions.
    require(
      _index < ownerLookup[msg.sender].nodeKeys.length,
      "The index supplied was >= the number of the Nodes belonging to the Owner."
    );
    
    // Do the lookup and return.
    return ownerLookup[msg.sender].nodeKeys[_index];
  }
  
  /// @notice Get all the relevant data for the Node with the given key: owner, ipfs, format, whether msg.sender owns the Node, and list of HalfEdge keys, with 0 for empty HalfEdge keys.
  /// @param _nodeKey The uint256 key to look up the Node data for.
  /// @return owner The address of the Node's owner.
  /// @return ipfs A bytes32[2] containing the IPFS hash for the Node.
  /// @return format A uint64 containing the Node's format.
  /// @return halfEdgeKeys The keys of each of the HalfEdges, or 0 if that slot is currently empty.
  /// @return halfEdgeCount A uint8 containing the number of HalfEdges, 0-6.
  /// @dev Callers are responsible for ignoring 0-valued HalfEdge keys. Someday when dynamic return lengths are possible, this will just return the set of 0-6 HalfEdge keys without empty slots.
  function getNode(uint256 _nodeKey) external view returns (
    address owner,
    bytes32[2] ipfs,
    uint64 format,
    uint256[6] halfEdgeKeys,
    uint8 halfEdgeCount
  ) {
    
    // Look up the Node in question.
    Node memory node = nodeLookup[_nodeKey];
    
    // Make sure it exists.
    require(
      uint(node.owner) != 0,
      "Node does not exist."
    );
    
    owner = node.owner;
    ipfs = node.ipfs;
    format = node.format;
    
    // Count how many halfEdgeKeys it has.
    halfEdgeCount = uint8(node.halfEdgeKeys.length);
    
    // Set our return values: the keys of each of the up-to-six HalfEdges, leaving it at 0 if beyond the current number of HalfEdges.
    for (uint8 i = 0; i < halfEdgeCount; i++) {
      halfEdgeKeys[i] = node.halfEdgeKeys[i];
    }
  }
  
  /// @notice Create a new HalfEdge on the graph.
  /// @param _nodeKey The uint256 key of the Node to which this HalfEdge will belong.
  /// @param _ipfs A bytes32[2] containing the HalfEdge's IPFS hash. Must be unique among all HalfEdges in the graph. Content must have the same format as the Node.
  function createHalfEdge(uint256 _nodeKey, bytes32[2] _ipfs) external {
    
    // Make sure there's something other than 0 in the first chunk of the ipfs hash.
    require(
      uint(_ipfs[0]) != 0,
      "_ipfs[0] was empty!"
    );
    
    Node memory node = nodeLookup[_nodeKey];
    
    // Make sure msg.sender owns the Node.
    require(
      msg.sender == node.owner,
      "You must own this Node to be able to add a HalfEdge to it."
    );
    
    // Make sure the Node doesn't already have 6 HalfEdges.
    require(
      node.halfEdgeKeys.length < 6,
      "You cannot have more than 6 HalfEdges on one Node."
    );
    
    // Make sure _ipfs isn't already used for a HalfEdge.
    // The paths connecting the maze of twisty little passages must *not* be all alike.
    uint256 newHalfEdgeKey = keyFromIpfs(_ipfs);
    require(
      halfEdgeLookup[newHalfEdgeKey].nodeKey == 0,
      "A HalfEdge with _ipfs already exists!"
    );
    
    // Instantiate and save the new HalfEdge at its key.
    halfEdgeLookup[newHalfEdgeKey] = HalfEdge({
      nodeKey: _nodeKey,
      ipfs: _ipfs,
      otherHalfEdgeKey: 0
    });
    
    // Add newHalfEdgeKey to its Node's halfEdgeKeys. // Note: make sure this 'sticks'... used to be 'node.halfEdgeKeys...' with 'node' as 'storage' above.
    nodeLookup[_nodeKey].halfEdgeKeys.push(newHalfEdgeKey);
    
    // Log the creation.
    emit HalfEdgeCreated(newHalfEdgeKey, msg.sender);
  }
  
  /// @notice Delete a HalfEdge from the graph.
  /// @param _halfEdgeKey The key of the HalfEdge to delete from the graph.
  function deleteHalfEdge(uint256 _halfEdgeKey) external {
    
    // Get the HalfEdge being deleted. Aren't changing it, but need its data a couple of times, so memory.
    HalfEdge memory halfEdge = halfEdgeLookup[_halfEdgeKey];
    
    // Make sure the HalfEdge exists by checking its nodeKey isn't 0, which it can never be,
    // because the msg.sender at the time the HalfEdge was created needed to own the Node,
    // and no one owns the Node with key 0 unless they know the preimage of keccak256 => 0 (if you do, please tell me :D).
    require(
      halfEdge.nodeKey != 0,
      "The HalfEdge must exist in order to be deleted."
    );
    
    // Make sure the HalfEdge isn't connected to another.
    require (
      halfEdge.otherHalfEdgeKey == 0,
      "You must disconnect this HalfEdge from its other half before deleting it."
    );
    
    // Get the Node of the HalfEdge being deleted. Will be changing its halfEdgeKeys array, so storage. (unless halfEdgeKeys storage later makes this unneeded???)
    Node storage node = nodeLookup[halfEdge.nodeKey];
    
    // Make sure the HalfEdge belongs to msg.sender.
    require (
      msg.sender == node.owner,
      "You must own this HalfEdge to be able to delete it."
    );
    
    // Delete the HalfEdge from its Node's halfEdgeKeys array:
    // ...Get that array as storage because we'll be using it several times, modifying it, and want the changes to stick.
    uint256[] storage halfEdgeKeys = node.halfEdgeKeys;
    
    // ...Check invariant: Nodes always have <= 6 HalfEdges.
    assert(halfEdgeKeys.length <= 6);
    
    // ...Iterate (up to 6 times) to find index of _halfEdgeKey in halfEdgeKeys.
    uint8 index = 0;
    for (uint8 i = 0; i < halfEdgeKeys.length; i++) {
      if (halfEdgeKeys[i] == _halfEdgeKey) {
        index = i;
        i = uint8(halfEdgeKeys.length); // cut out early
      }
    }
    
    // ...If the HalfEdge is not the last element in the array, swap the last element over top of it.
    uint8 lastIndex = uint8(halfEdgeKeys.length - 1);
    if (index < lastIndex) {
      halfEdgeKeys[index] = halfEdgeKeys[lastIndex];
    }
    
    // ...Either way, then delete the last element and shrink the array.
    delete halfEdgeKeys[lastIndex];
    halfEdgeKeys.length--;
    
    // Delete the HalfEdge from the halfEdgeLookup mapping.
    delete halfEdgeLookup[_halfEdgeKey];
    
    // Log the deletion.
    emit HalfEdgeDeleted(_halfEdgeKey, msg.sender);
  }
  
  /// @notice Get the ipfs hash, format, and node key for the HalfEdge with this key, and for its otherHalfEdge if it exists, too.
  /// @return nodeKey The uint256 key of the HalfEdge's Node.
  /// @return ipfs A bytes32[2] containing the HalfEdge's IPFS hash.
  /// @return format A uint64 containing the HalfEdge's format (from its Node)
  /// @return connected A bool indicating if the HalfEdge is connected to another one.
  /// @return othernodeKey The uint256 key of the other HalfEdge's Node, if connected (or 0 if not).
  /// @return otherIpfs A bytes32[2] containing the IPFS hash of the other HalfEdge, if connected (or an array of two 0x0s if not).
  /// @return otherFormat A uint64 containing the format of the other HalfEdge (from its Node), if connected (or 0 if not).
  function getEdge(uint256 _halfEdgeKey) external view returns (
    uint256 nodeKey,
    bytes32[2] ipfs,
    uint64 format,
    bool connected,
    uint256 othernodeKey,
    bytes32[2] otherIpfs,
    uint64 otherFormat
  ) {
    
    // Grab the HalfEdge.
    HalfEdge memory halfEdge = halfEdgeLookup[_halfEdgeKey];
    
    // Make sure it exists.
    require(
      halfEdge.nodeKey != 0,
      "HalfEdge does not exist."
    );
    
    // Get this HalfEdge's data.
    nodeKey = halfEdge.nodeKey;
    ipfs = halfEdge.ipfs;
    format = nodeLookup[halfEdge.nodeKey].format;
    
    // Check for and, if it exists, get, the otherHalfEdge's data.
    if (halfEdge.otherHalfEdgeKey != 0) {
      HalfEdge memory otherHalfEdge = halfEdgeLookup[halfEdge.otherHalfEdgeKey];
      
      // If otherHalfEdge doesn't exist, despite otherHalfEdgeKey not being 0, we have an invariant failure which we may as well check for here.
      assert(otherHalfEdge.nodeKey != 0);
      
      connected = true;
      othernodeKey = otherHalfEdge.nodeKey;
      otherIpfs = otherHalfEdge.ipfs;
      otherFormat = nodeLookup[otherHalfEdge.nodeKey].format;
    }
    // Else, just return the 0-initialized values.
  }
}
