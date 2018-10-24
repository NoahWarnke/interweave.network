pragma solidity ^0.4.24;

/// @title The Interweave Network graph contract.
/// @author interweaver
/// @notice This is still a development version, but for now, is intended to represent a full graph.
contract InterweaveGraph {
    
  /// @notice Node struct represents a node in the graph (a place), with owner, representation with format, and connections to other Nodes.
  struct Node {
    address ownerAddr;
    bytes32[2] ipfs;
    uint64 format;
    uint256[6] edgeNodeKeys;
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
  
  /// @notice A Mapping allowing lookup of Nodes by their keys.
  /// @dev Node keys = uint256(kekkac(ipfs))
  mapping (uint256 => Node) internal nodeLookup;
  
  /// @notice A mapping allowing lookup of Owners by their (Ethereum) addresses.
  mapping (address => Owner) internal ownerLookup;
  
  /// @notice A function to generate a unique key for a Node from a given IPFS hash.
  /// @param _ipfs A bytes32[2] to use to generate the new key.
  /// @return A uint256 key.
  function nodeKeyFromIpfs(bytes32[2] _ipfs) public pure returns (uint256) {
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
  /// @dev If the caller wants to know the key of their new Node, they can always call nodeKeyFromIpfs on their IPFS hash, before or after Node creation (assuming it doesn't fail.)
  function createNode(bytes32[2] _ipfs, uint64 _format) external {
    
    // Make sure there's something other than 0 in the first chunk of the ipfs hash.
    require(
      uint(_ipfs[0]) != 0,
      "_ipfs[0] was empty!"
    );
    
    // Generate Node's key.
    uint256 newNodeKey = nodeKeyFromIpfs(_ipfs);
    
    // There must not already be a Node at that key`.
    // The maze of twisty little passages must *not* be all alike.
    require(
      uint(nodeLookup[newNodeKey].ipfs[0]) == 0,
      "A Node with _ipfs already exists!"
    );
    
    // Instantiate and save the new Node at its key.
    Node memory newNode;
    newNode.ownerAddr = msg.sender;
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
      msg.sender == node.ownerAddr,
      "You must own this Node to be able to delete it."
    );
    
    // Make sure the Node is not connected to any others.
    for (uint8 i = 0; i < 6; i++) {
      require(
        uint(node.edgeNodeKeys[i]) == 0,
        "You must disconnect this Node from all other Nodes before deleting it."
      );
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
  
  /// @notice Get all the relevant data for the Node with the given key: owner, ipfs, format, whether msg.sender owns the Node, and list of HalfEdge keys, with 0 for empty HalfEdge keys.
  /// @param _nodeKey The uint256 key to look up the Node data for.
  /// @return ownerAddr The address of the Node's owner.
  /// @return ipfs A bytes32[2] containing the IPFS hash for the Node.
  /// @return format A uint64 containing the Node's format.
  /// #return edgeNodeCount A uint8 containing the number of edge Nodes.
  /// @return edgeNodeKeys The keys of each of the edge Nodes, or 0 if that slot is currently empty.
  /// @dev Callers are responsible for ignoring 0-valued edgeNodeKeys entries. Someday when dynamic return lengths are possible, this will just return the set of 0-6 HalfEdge keys without empty slots.
  function getNode(uint256 _nodeKey) external view returns (
    address ownerAddr,
    bytes32[2] ipfs,
    uint64 format,
    uint8 edgeNodeCount,
    uint256[6] edgeNodeKeys
  ) {
    
    // Look up the Node in question.
    Node memory node = nodeLookup[_nodeKey];
    
    // Make sure it exists.
    require(
      uint(node.ownerAddr) != 0,
      "Node does not exist."
    );
    
    ownerAddr = node.ownerAddr;
    ipfs = node.ipfs;
    format = node.format;
    edgeNodeKeys = node.edgeNodeKeys;
    
    // Quick count of number of connected Nodes.
    edgeNodeCount = 0;
    for (uint8 i = 0; i < 6; i++) {
      if (edgeNodeKeys[i] != 0) {
        edgeNodeCount++;
      }
    }
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
}
