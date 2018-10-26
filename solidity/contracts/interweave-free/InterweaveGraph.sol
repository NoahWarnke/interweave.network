pragma solidity ^0.4.24;

/// @title The Interweave Network graph contract.
/// @author interweaver
/// @notice This is still a development version, but for now, is intended to represent a full graph.
contract InterweaveGraph {
    
  /// @notice Node struct represents a node in the graph (a place), with owner, representation with format, and connections to other Nodes.
  struct Node {
    address ownerAddr;
    bytes32[2] ipfs;
    uint256[6] edgeNodeKeys;
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
  /// @dev If the caller wants to know the key of their new Node, they can always call nodeKeyFromIpfs on their IPFS hash, before or after Node creation (assuming it doesn't fail.)
  function createNode(bytes32[2] _ipfs) external {
    
    // Make sure there's something other than 0 in the first chunk of the ipfs hash.
    require(
      uint(_ipfs[0]) != 0,
      "_ipfs[0] was empty!"
    );
    
    // Generate Node's key.
    uint256 newNodeKey = nodeKeyFromIpfs(_ipfs);
    
    // There must not already be a Node at that key.
    // The maze of twisty little passages must *not* be all alike.
    require(
      uint(nodeLookup[newNodeKey].ipfs[0]) == 0,
      "A Node with _ipfs already exists!"
    );
    
    // Instantiate and save the new Node at its key.
    Node memory newNode;
    newNode.ownerAddr = msg.sender;
    newNode.ipfs = _ipfs;
    
    nodeLookup[newNodeKey] = newNode; // Set 3 slots of storage: 60k gas right there!
    
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
    
    // Delete the Node's key from the nodeLookup mapping.
    delete nodeLookup[_nodeKey];
    
    // Log the Node deletion.
    emit NodeDeleted(_nodeKey, msg.sender);
  }
  
  /// @notice Get all the relevant data for the Node with the given key: owner, ipfs, and list of edge Node keys, with 0 for empty keys.
  /// @param _nodeKey The uint256 key to look up the Node data for.
  /// @return ownerAddr The address of the Node's owner.
  /// @return ipfs A bytes32[2] containing the IPFS hash for the Node.
  /// @return edgeNodeKeys The keys of each of the edge Nodes, or 0 if that slot is currently empty.
  /// @dev Callers are responsible for ignoring 0-valued edgeNodeKeys entries. Someday when dynamic return lengths are possible, this will just return the set of 0-6 HalfEdge keys without empty slots.
  function getNode(uint256 _nodeKey) external view returns (
    address ownerAddr,
    bytes32[2] ipfs,
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
    edgeNodeKeys = node.edgeNodeKeys;
  }
}
