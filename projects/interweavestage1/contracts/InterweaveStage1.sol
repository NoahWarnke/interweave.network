pragma solidity ^0.4.25;

/// @title The first stage of the Interweave graph contract.
/// @author interweaver
/// @notice This will be supplanted by later stages, but for now, is intended to represent a full graph.
contract InterweaveStage1 {
    
    /// @notice Node struct represents a node in the graph.
    struct Node {
        address owner;
        bytes32 ipfs;
        uint32 format;
        address[] edges;
        mapping(address => bool) edgeIsConnected;
        uint8 numFinalizedEdges; // May not be larger than 6. How many proposed? edges.length - numFinalizedEdges.
    }
    
    /// @notice Edge struct represents an edge connecting two nodes in the graph.
    struct Edge {
        address node0;
        address node1;
        bytes32 ipfs0;
        bytes32 ipfs1;
        uint8 flags;
    }
    
    /// @notice Event for when nodes get added.
    event AddNode(address nodeAddress, address nodeOwner);
    
    /// @notice Event for when nodes get removed.
    event DeleteNode(address nodeAddress, address nodeOwner);
    
    /// @notice This is the main Node lookup mapping, going from node addresses to Nodes.
    mapping (address => Node) public lookUpNode;
    
    /// @notice This is the main Edge lookup mapping, going from edge addresses to Edges.
    mapping (address => Edge) public lookUpEdge;
    
    // @notice This is the Node lookup-by-owner mapping; there needs to be a way of figuring out which nodes you own without iterating over all nodes!
    mapping (address => address[]) private ownerToNodes;
    
    /// @notice Allow users to create new nodes.
    /// @param _ipfs The bytes32 form of an IPFS hash (the Qm will be assumed: viewers should check this!)
    /// @param _format A uint32 describing the node's format. If this doesn't match the file at the given hash, viewers won't be able to render your node.
    /// @return The new node's address.
    function createNode(bytes32 _ipfs, uint32 _format) external returns (address) {
        
        // Create node address from hash of ipfs hash.
        // Enforces only one node per ipfs file!
        address newNodeAddress = address(keccak256(abi.encodePacked(_ipfs)));
        
        // Enforce node at newNodeAddress not already used (or owned by 0x0...)
        require(uint(lookUpNode[newNodeAddress].owner) == 0, "IPFS hash was already used for a node!");
        
        Node memory newNode = Node({
            owner: msg.sender,
            ipfs: _ipfs,
            format: _format,
            edges: new address[](0),
            numFinalizedEdges: 0
        });
        
        // Save the node at its address.
        lookUpNode[newNodeAddress] = newNode;
        
        // Also save the node address in its owner's list of owned nodes.
        ownerToNodes[msg.sender].push(newNodeAddress);
        
        // Emit an event indicating the added node.
        emit AddNode(newNodeAddress, msg.sender);
        
        return newNodeAddress;
    }
    
    function deleteNode(address _nodeAddress) external {
        
        // Get the Node being deleted.
        Node storage node = lookUpNode[_nodeAddress];
        
        // Make sure it can be deleted.
        require(node.owner == msg.sender, "You must own this node to be able to delete it.");
        require(node.numFinalizedEdges == 0, "You must disconnect this node from all other nodes before deleting it.");
        
        uint numProposedEdges = node.edges.length;
        // Delete its 'edges' mapping, first of all (otherwise no way to get this storage back).
        // Fortunately our mapping is from uint8s, so we can enumerate.
        for (uint i = 0; i < numProposedEdges; i++) {
            
            address edgeAddr = node.edges[i];
            
            if (lookUpNode[lookUpEdge[edgeAddr].node0].owner == 0) {
                // The node on the other end of the edge (node0, since this was a proposed edge by someone else)
                // was already deleted at some earlier time, so just delete the edge in the lookup.
                delete lookUpEdge[edgeAddr];
            }
            
            // Note, this leaves a 'hanging proposed edge' if the other node was not deleted.
            // This is fine: if they delete that node, the edge will get deleted. Otherwise they can clean up if they care.
            
            delete node.edges[i];
        }
        
        
        // Delete node from lookUpNode;
        delete lookUpNode[_nodeAddress];
        
        // Delete node from ownerToNodes array.
        address[] storage nodesOfOwner = ownerToNodes[msg.sender]; // storage because we'll be modifying it and want the changes to stick.
        
        uint len = nodesOfOwner.length;
        for (uint j = 0; j < len; j++) {
            if (nodesOfOwner[j] == _nodeAddress) {
                if (j < len - 1) {
                    // Not last in array, so would leave a hole: overwrite node with last node in array.
                    nodesOfOwner[j] = nodesOfOwner[len - 1];
                    j = len - 1; // Jump counter to the end (will short-circuit the for loop, too)
                }
                
                // Remove last node address from array.
                delete nodesOfOwner[j];
                nodesOfOwner.length--;
            }
        }
        
        // Emit an event indicating the deleted node.
        emit DeleteNode(_nodeAddress, msg.sender);
        
    }
    
    /// @notice Get how many nodes are owned by the given owner.
    /// @param _owner The address of the owner to check.
    /// @return How many nodes they own.
    function getNodeCountForOwner(address _owner) public view returns (uint) {
        return ownerToNodes[_owner].length;
    }
    
    /// @notice Get a node address by index for the given owner.
    /// @param _owner The address of the owner to check.
    /// @param _index The index of the node to check (must be less than the number returned by getNodeCountForOwner).
    /// @return The address of the node at that index.
    function getNodeNumberForOwner(address _owner, uint _index) public view returns (address) {
        require(_index < ownerToNodes[_owner].length, "The index supplied was >= the number of your nodes.");
        return (ownerToNodes[_owner])[_index];
    }
     
}
