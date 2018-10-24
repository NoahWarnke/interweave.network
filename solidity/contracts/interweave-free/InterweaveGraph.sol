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
    uint256[6] nodeKeys;
    uint64 ownerNodesIndex; // Supports efficient deleting of nodes.
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
  
  event EdgeCreated(uint256 nodeKey0, uint256 nodeKey1, address indexed ownerAddr0, address indexed ownerAddr1);
  
  event EdgeDeleted(uint256 nodeKey0, uint256 nodeKey1, address indexed ownerAddr0, address indexed ownerAddr1);
  
  /// @notice A Mapping allowing lookup of Nodes by their keys.
  /// @dev Node keys = uint256(kekkac(ipfs))
  mapping (uint256 => Node) internal nodeLookup;
  
  /// @notice A mapping allowing lookup of Owners by their (Ethereum) addresses.
  mapping (address => Owner) internal ownerLookup;
  
  /// @notice A function to generate a unique key for a Node from a given IPFS hash.
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
    Node memory newNode;
    newNode.owner = msg.sender;
    newNode.ipfs = _ipfs;
    newNode.format = _format;
    newNode.ownerNodesIndex = uint64(ownerLookup[msg.sender].nodeKeys.length);// We're gonna push it onto the end.
    nodeLookup[newNodeKey] = newNode;
    
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
    for (uint8 i = 0; i < 6; i++) {
      require(
        uint(node.nodeKeys[i]) == 0,
        "You must disconnect this Node from all other Nodes before deleting it."
      );
    }
    
    // Delete the Node from its Owner's nodeKeys array:
    // ...Get that array as storage because we'll be using it several times, modifying it, and want the changes to stick.
    uint256[] storage nodeKeys = ownerLookup[msg.sender].nodeKeys; // TODO check storage
    
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
  /// @return nodeKeys The keys of each of the HalfEdges, or 0 if that slot is currently empty.
  /// @dev Callers are responsible for ignoring 0-valued nodeKeys entries. Someday when dynamic return lengths are possible, this will just return the set of 0-6 HalfEdge keys without empty slots.
  function getNode(uint256 _nodeKey) external view returns (
    address owner,
    bytes32[2] ipfs,
    uint64 format,
    uint256[6] nodeKeys
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
    nodeKeys = node.nodeKeys;
  }
  
  /// @notice Toggle whether the pair of Nodes with the given keys, which must be owned by msg.sender, are connected to each other or not. Will error if they are neither connected nor disconnected.
  /// @param _nodeKey0 The uint256 key of the first Node to connect to/disconnect from the second one.
  /// @param _nodeKey1 The uint256 key of the second Node to connect to/disconnect from the first one.
  function toggleEdge(uint256 _nodeKey0, uint8 slot0, uint8 slot1, uint256 _nodeKey1) external {
    
    // Make sure slots are in a valid range.
    require(
      slot0 < 6 && slot1 < 6,
      "Both slots must be in the range 0 - 5."
    );
    
    Node storage node0 = nodeLookup[_nodeKey0]; // TODO check storage
    
    // Make sure Node 0 exists and is owned by msg.sender.
    require(
      node0.owner == msg.sender,
      "You must own the Node at _nodeKey0 in order to toggle its connection."
    );
    
    Node storage node1 = nodeLookup[_nodeKey1];
    
    // Make sure Node 1 exists and is owned by msg.sender.
    require(
      node1.owner == msg.sender,
      "You must own the Node at _nodeKey1 in order to toggle its connection."
    );
    
    if (node0.nodeKeys[slot0] == _nodeKey1 && node1.nodeKeys[slot1] == _nodeKey0) {
      // Disconnect 'em.
      node0.nodeKeys[slot0] = 0;
      node1.nodeKeys[slot1] = 0;
    }
    else if (node0.nodeKeys[slot0] == 0 && node1.nodeKeys[slot1] == 0) {
      // Connect 'em.
      node0.nodeKeys[slot0] = _nodeKey1;
      node1.nodeKeys[slot1] = _nodeKey0;
    }
    else {
      // Throwing at this point is not required, but will provide useful feedback.
      require(false, "Your Nodes are neither both connected to each other nor both disconnected to any Node.");
    }
  }
}
