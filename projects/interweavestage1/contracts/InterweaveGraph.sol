pragma solidity ^0.4.25;

/// @title The Interweave Network graph contract.
/// @author interweaver
/// @notice This is still a development version, but for now, is intended to represent a full graph.
contract InterweaveGraph {
    
    /// @notice Node struct represents a node in the graph (a place), with owner, representation with format, and connections to other Nodes.
    struct Node {
        address ownerAddr;
        bytes32 ipfs;
        uint32 format;
        uint32 ownerNodesIndex; // Supports efficient deleting of nodes. Don't create more than 4 billion nodes, yo.
        address[] halfEdgeAddrs;
    }
    
    /// @notice HalfEdge struct represents half of an edge in the graph, with the Node it belongs to, representation with implicit format, and connection to another HalfEdge.
    struct HalfEdge {
        address nodeAddr;
        bytes32 ipfs; // format = format of node
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
    /// @param _ipfs The IPFS hash of the Node's content. Must be unique in the graph. "Qm" is assumed prior to the IPFS hash, which is in 16-bit encoding, rather than 58-bit.
    /// @param _format The format identifier of the Node's content. Must match with the file at the given IPFS hash, or viewers won't be able to interpret the content.
    function createNode(bytes32 _ipfs, uint32 _format) external returns (address) {
        
        // Generate Node's address from the IPFS hash.
        address newNodeAddress = address(keccak256(abi.encodePacked(_ipfs)));
        
        // There must not already be a node at that address.
        // The maze of twisty little passages must *not* be all alike.
        require(
            uint(nodeLookup[newNodeAddress].ownerAddr) == 0,
            "A node with _ipfs already exists!"
        );
        
        // Instantiate our new Node.
        Node memory newNode = Node({
            ownerAddr: msg.sender,
            ipfs: _ipfs,
            format: _format,
            ownerNodesIndex: uint32(ownerLookup[msg.sender].nodeAddrs.length), // We're gonna push it onto the end.
            halfEdgeAddrs: new address[](0)
        });
        
        // Save the node at its address.
        nodeLookup[newNodeAddress] = newNode;
        
        // Also save the new Node's address in its Owner's list of nodes.
        ownerLookup[msg.sender].nodeAddrs.push(newNodeAddress);
        
        // Emit an event indicating that the Node was created.
        emit NodeCreated(newNodeAddress, msg.sender);
        
        // Finally, hand back the new Node's address to the caller.
        return newNodeAddress;
    }
    
    /// @notice Delete a Node from the graph.
    /// @param _nodeAddr The address of the Node to delete from the graph.
    function deleteNode(address _nodeAddr) external {
      
      // Get the Node being deleted.
      Node memory node = nodeLookup[_nodeAddr];
      
      // Make sure the Node can be deleted.
      require(
        node.ownerAddr == msg.sender,
        "You must own this node to be able to delete it."
      );
      for (uint8 i = 0; i < node.halfEdgeAddrs.length; i++) {
        require(
          uint(halfEdgeLookup[node.halfEdgeAddrs[i]].otherHalfEdgeAddr) == 0,
          "You must disconnect this node from all other nodes before deleting it."
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
      
      // Emit an event indicating that the Node was deleted.
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
    
    function createHalfEdge(address _nodeAddr, bytes32 _ipfs) external returns (address) { }
    
    function deleteHalfEdge(address _halfEdgeAddr) external returns (address) { }
    
    function createEdgeProposal(address _halfEdgeAddr0, address _halfEdgeAddr1) external returns (address) { }
    
    function acceptEdgeProposal(address _edgeProposalAddr) external { }
    
    function rejectEdgeProposal(address _edgeProposalAddr) external { }
    
    function getOwnerEdgeProposalCount(address _ownerAddr) public view returns (uint) { }
    
    function getOwnerEdgeProposalAddrByIndex(address _ownerAddr, uint _index) public view returns (address) { }
}
